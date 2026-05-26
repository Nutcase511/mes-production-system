/**
 * 通用真实数据页面生成器
 * 快速将模拟数据页面改造成真实数据页面
 * 使用 @airiot/client 的 createAPI 实现
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { EditableTable } from '@/components/EditableTable'
import { useTableData } from '@/hooks'
import { createAPI } from '@airiot/client'
import { getTableConfig } from '@/config/tables.config'
import { toastApi } from '@/components/ui/toast'
import { ProductionTableBlock } from '@/blocks/production-table'
import { Plus, Search, RefreshCw } from 'lucide-react'

/**
 * 创建真实数据页面的 Hook
 * @param configKey - 表配置键名（如 'EQUIPMENT_LIST'）
 * @param options - 额外选项
 */
export function useRealDataPage(configKey: string, options: {
  /** 页面标题（可选，默认使用配置中的 tableName） */
  pageTitle?: string
  /** 搜索框占位符 */
  searchPlaceholder?: string
  /** 新建按钮文字 */
  createButtonText?: string
  /** 编辑按钮文字 */
  editButtonText?: string
  /** 是否显示筛选器 */
  showFilters?: boolean
  /** 自定义筛选器 */
  customFilters?: React.ReactNode
} = {}) {
  // 获取表配置
  const tableConfig = getTableConfig(configKey)
  const tableId = tableConfig?.tableId || ''
  const tableName = tableConfig?.tableName || ''
  const searchFields = tableConfig?.searchFields || []

  // 解构选项
  const {
    pageTitle = tableName,
    searchPlaceholder = `请输入关键词`,
    createButtonText = `新建${tableName}`,
    editButtonText = `编辑${tableName}`,
    // showFilters 未使用，但保留在选项中以保持API兼容性
    customFilters = null,
  } = options

  // 关联表数据缓存
  const [relatedTablesData, setRelatedTablesData] = useState<Record<string, any[]>>({})
  const [loadingRelatedTables, setLoadingRelatedTables] = useState<Record<string, boolean>>({})
  const loadingRelatedTablesRef = useRef<Record<string, boolean>>({})
  const loadedRelatedTablesRef = useRef<Set<string>>(new Set())
  
  // 关联表 API 实例缓存
  const relatedAPIRef = useRef<Record<string, ReturnType<typeof createAPI>>>({})

  // 使用统一的 useTableData Hook
  const tableData = useTableData(tableId, {
    searchFields,
    autoLoad: true,
    onCreateSuccess: () => {
      closeAllDialogs()
      reload()
    },
    onUpdateSuccess: () => {
      closeAllDialogs()
      reload()
    },
  })

  const {
    // Schema 和数据
    schema,
    schemaLoading,
    data,
    loading,
    pagination,
    searchText,
    filters,
    setSearchText,
    setFilter,
    reload,
    reset,
    changePage,
    changePageSize,

    // 表单
    formData,
    submitting,
    updateField,

    // CRUD 操作
    createRecord,
    updateRecord,

    // 弹窗控制
    isCreateOpen,
    isEditOpen,
    isViewOpen,
    editingId,
    viewingRecord,
    openCreate,
    openEdit,
    openView,
    closeAllDialogs,
  } = tableData

  // 加载关联表数据 - 使用 @airiot/client 的 createAPI
  const loadRelatedTableData = useCallback(async (relatedTableId: string) => {
    if (loadedRelatedTablesRef.current.has(relatedTableId) ||
        loadingRelatedTablesRef.current[relatedTableId]) {
      return
    }

    loadingRelatedTablesRef.current[relatedTableId] = true
    setLoadingRelatedTables({ ...loadingRelatedTablesRef.current })

    try {
      // 获取或创建 API 实例
      if (!relatedAPIRef.current[relatedTableId]) {
        const isUserTable = relatedTableId.toLowerCase() === 'user'
        relatedAPIRef.current[relatedTableId] = createAPI({
          resource: isUserTable ? 'core/user' : `core/t/${relatedTableId}/d`,
        })
      }
      const api = relatedAPIRef.current[relatedTableId]

      const { items } = await api.query({ skip: 0, limit: 1000 }, undefined, false)

      setRelatedTablesData(prev => ({ ...prev, [relatedTableId]: items }))
      loadedRelatedTablesRef.current.add(relatedTableId)
    } catch (error: any) {
      // Silently handle related table loading errors
      toastApi.error(error.message || '加载关联表数据失败')
    } finally {
      loadingRelatedTablesRef.current[relatedTableId] = false
      setLoadingRelatedTables({ ...loadingRelatedTablesRef.current })
    }
  }, [])

  // 当弹窗打开时，预加载所有关联表数据
   
  useEffect(() => {
    if ((isCreateOpen || isEditOpen) && schema?.schema?.properties) {
      Object.entries(schema.schema.properties).forEach(([, fieldSchema]: [string, any]) => {
        if (fieldSchema.relateTo && !loadedRelatedTablesRef.current.has(fieldSchema.relateTo)) {
          loadRelatedTableData(fieldSchema.relateTo)
        }
      })
    }
    if (!isCreateOpen && !isEditOpen) {
      loadedRelatedTablesRef.current.clear()
    }
  })

  // 获取关联表的显示字段
  const getRelatedTableDisplayField = (relatedTableId: string, fieldSchema: any): string => {
    if (relatedTableId.toLowerCase() === 'user') {
      return 'name'
    }
    return fieldSchema.titleField || 'serial-number-1773'
  }

  // 渲染关联字段的选项
  const renderRelatedFieldOptions = (relatedTableId: string, fieldSchema: any) => {
    const items = relatedTablesData[relatedTableId] || []
    const displayField = getRelatedTableDisplayField(relatedTableId, fieldSchema)
    const isUserTable = relatedTableId.toLowerCase() === 'user'

    if (items.length === 0) {
      return (
        <div className="p-2 text-sm text-blue-200 text-center">
          {loadingRelatedTables[relatedTableId] ? '加载中...' : '暂无数据'}
        </div>
      )
    }

    return items
      .filter((item: any) => item.id)  // 过滤掉 id 为空的选项
      .map((item: any) => {
        const displayValue = item[displayField] || item.id
        const itemValue = isUserTable ? JSON.stringify(item) : item.id
        return (
          <SelectItem key={item.id} value={itemValue}>
            {displayValue}
          </SelectItem>
        )
      })
  }

  // 根据字段类型渲染表单控件
  const renderFormField = (fieldKey: string, fieldSchema: any) => {
    const fieldType = fieldSchema.type
    const fieldTitle = fieldSchema.title || fieldKey
    const fieldDescription = fieldSchema.description || ''
    const value = formData[fieldKey] || ''

    // 表格字段 - 使用可编辑表格组件
    if (fieldSchema.tableFields) {
      return (
        <EditableTable
          value={value || []}
          onChange={(newValue) => updateField(fieldKey, newValue)}
          tableFields={fieldSchema.tableFields}
          relatedTablesData={relatedTablesData}
          loadingRelatedTables={Object.values(loadingRelatedTables).some(Boolean)}
          onLoadRelatedTable={loadRelatedTableData}
        />
      )
    }

    // 只读字段
    if (fieldSchema.readonly || fieldKey === 'serial-number-1773') {
      return (
        <Input
          id={fieldKey}
          value={value}
          disabled
          className="h-10 bg-white/5 border-blue-400/30 text-white opacity-60"
        />
      )
    }

    // 关联字段
    if (fieldSchema.relateTo) {
      const relatedTableId = fieldSchema.relateTo
      const isUserTable = relatedTableId.toLowerCase() === 'user'

      const handleValueChange = (val: string) => {
        if (isUserTable) {
          try {
            const userObj = JSON.parse(val)
            updateField(fieldKey, userObj)
          } catch {
            updateField(fieldKey, val)
          }
        } else {
          updateField(fieldKey, val)
        }
      }

      let selectValue = ''
      if (isUserTable) {
        selectValue = typeof value === 'object' ? JSON.stringify(value) : value
      } else {
        selectValue = value || ''
      }

      return (
        <Select
          value={selectValue}
          onValueChange={handleValueChange}
          disabled={loadingRelatedTables[relatedTableId]}
        >
          <SelectTrigger className="w-full bg-blue-500/10 border-blue-400/30 text-white">
            <SelectValue placeholder={loadingRelatedTables[relatedTableId] ? '加载中...' : `请选择${fieldTitle}`} />
          </SelectTrigger>
          <SelectContent>
            {renderRelatedFieldOptions(relatedTableId, fieldSchema)}
          </SelectContent>
        </Select>
      )
    }

    // 带有 enum1 和 enum_title1 的选择器
    if (fieldSchema.enum1 && fieldSchema.enum_title1) {
      const enumValues = fieldSchema.enum1
      const enumTitles = fieldSchema.enum_title1
      const options = enumValues.map((val: string, idx: number) => ({
        value: val,
        label: enumTitles[idx] || val
      }))

      return (
        <Select
          value={value}
          onValueChange={(val) => updateField(fieldKey, val)}
        >
          <SelectTrigger className="w-full bg-blue-500/10 border-blue-400/30 text-white">
            <SelectValue placeholder={`请选择${fieldTitle}`} />
          </SelectTrigger>
          <SelectContent>
            {options
              .filter((opt: { value: string; label: string }) => opt.value)
              .map((opt: { value: string; label: string }) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    // 根据 fieldType 处理不同类型
    switch (fieldType) {
      case 'string':
        // 日期类型
        if (fieldSchema.format === 'date') {
          return (
            <Input
              id={fieldKey}
              type="date"
              className="h-10 bg-blue-500/10 border-blue-400/30 text-white"
              value={value}
              onChange={(e) => updateField(fieldKey, e.target.value)}
            />
          )
        }

        // 根据 textType 判断单行还是多行文本
        // textType: "textarea" → 多行文本
        // textType: "input" 或未设置 → 单行文本
        const isMultiline = fieldSchema.textType === 'textarea'

        if (isMultiline) {
          return (
            <Textarea
              id={fieldKey}
              className="bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50 min-h-[80px]"
              placeholder={fieldDescription || `请输入${fieldTitle}`}
              value={value}
              onChange={(e) => updateField(fieldKey, e.target.value)}
            />
          )
        }

        // 普通文本输入（单行）
        return (
          <Input
            id={fieldKey}
            className="h-10 bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50"
            placeholder={fieldDescription || `请输入${fieldTitle}`}
            value={value}
            onChange={(e) => updateField(fieldKey, e.target.value)}
          />
        )

      case 'number':
        return (
          <Input
            id={fieldKey}
            type="number"
            className="h-10 bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50"
            placeholder={fieldDescription || `请输入${fieldTitle}`}
            value={value}
            onChange={(e) => updateField(fieldKey, e.target.value)}
          />
        )

      case 'boolean':
        return (
          <Select
            value={value ? 'true' : 'false'}
            onValueChange={(val) => updateField(fieldKey, val === 'true')}
          >
            <SelectTrigger className="w-full bg-blue-500/10 border-blue-400/30 text-white">
              <SelectValue placeholder={`请选择${fieldTitle}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">是</SelectItem>
              <SelectItem value="false">否</SelectItem>
            </SelectContent>
          </Select>
        )

      default:
        return (
          <Input
            id={fieldKey}
            className="h-10 bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50"
            placeholder={fieldDescription || `请输入${fieldTitle}`}
            value={value}
            onChange={(e) => updateField(fieldKey, e.target.value)}
          />
        )
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateRecord(editingId, formData)
      } else {
        await createRecord(formData)
      }
    } catch (error) {
      // 错误已经在 Hook 中处理
    }
  }

  // 渲染搜索筛选栏
  const renderSearchBar = () => (
    <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4" style={{
      borderColor: 'rgba(59, 130, 246, 0.3)'
    }}>
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex gap-4 items-center flex-1 flex-wrap">
          <div className="flex items-center gap-2 flex-1">
            <Label className="whitespace-nowrap text-blue-200">搜索</Label>
            <Input
              className="flex-1 h-9 bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50"
              placeholder={searchPlaceholder}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  reload()
                }
              }}
            />
          </div>
          {customFilters}
          <div className="flex gap-2">
            <Button onClick={reload} className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500">
              <Search className="w-4 h-4 mr-2" />
              搜索
            </Button>
            <Button variant="outline" onClick={reset} className="text-blue-100 border-blue-400/40 hover:bg-blue-500/10">
              重置
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reload} className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button onClick={openCreate} className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Plus className="w-4 h-4 mr-2" />
            {createButtonText}
          </Button>
        </div>
      </div>
    </Card>
  )

  // 渲染数据表格
  const renderTable = () => (
    <div className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-0" style={{
      borderColor: 'rgba(59, 130, 246, 0.3)'
    }}>
      <ProductionTableBlock
        data={data}
        loading={loading || schemaLoading}
        schema={schema || undefined}
        onRowClick={openView}
        onDetailOrder={openView}
        onEditOrder={openEdit}
        pagination={{
          ...pagination,
          onPageChange: changePage,
          onPageSizeChange: changePageSize,
        }}
      />
    </div>
  )

  // 渲染新建/编辑弹窗
  const renderFormDialog = () => (
    <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
      if (!open) closeAllDialogs()
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] !flex !flex-col !p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-700 shrink-0">
          <DialogTitle className="text-slate-100">{editingId ? editButtonText : createButtonText}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {editingId ? `修改以下信息更新${tableName}` : `填写以下信息创建新的${tableName}`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar min-h-0">
          {schema && schema.schema && schema.schema.properties ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              {(schema?.schema.form || Object.keys(schema.schema.properties))
                .filter((key: string) => {
                  const field = schema.schema?.properties?.[key]
                  if (!field || key.startsWith('_')) return false

                  // 获取字段配置
                  const fieldConfig = tableConfig?.fieldConfigs?.[key]

                  // 如果字段配置了 hideOnCreate 或 readonlyOnEdit，需要特殊处理
                  const hasCustomConfig = fieldConfig?.hideOnCreate || fieldConfig?.readonlyOnEdit

                  // 如果有自定义配置，不使用 schema 的 readonly 逻辑
                  if (!hasCustomConfig && field.readonly) {
                    return false
                  }

                  // 如果是新建模式且字段配置为隐藏，则不显示
                  if (!editingId && fieldConfig?.hideOnCreate) {
                    return false
                  }

                  return true
                })
                .map((fieldKey: string) => {
                  const fieldSchema = schema.schema?.properties?.[fieldKey]
                  const fieldTitle = fieldSchema?.title || fieldKey
                  const isRequired = schema.schema.required?.includes(fieldKey)

                  // 获取字段配置
                  const fieldConfig = tableConfig?.fieldConfigs?.[fieldKey]

                  // 如果是编辑模式且字段配置为只读，则临时设置为只读
                  const isReadonlyOnEdit = editingId && fieldConfig?.readonlyOnEdit === true

                  const isFullWidth = fieldKey.startsWith('text-') || fieldKey.startsWith('upload-') || !!fieldSchema?.tableFields

                  return (
                    <div key={fieldKey} className={isFullWidth ? 'col-span-2 space-y-2' : 'space-y-2'}>
                      <Label htmlFor={fieldKey} className="text-blue-200 text-sm">
                        {fieldTitle}
                        {isRequired && !isReadonlyOnEdit && <span className="text-red-400 ml-1">*</span>}
                      </Label>
                      {isReadonlyOnEdit ? (
                        <Input
                          id={fieldKey}
                          value={formData[fieldKey] || ''}
                          disabled
                          className="h-10 bg-white/5 border-blue-400/30 text-white opacity-60"
                        />
                      ) : (
                        fieldSchema && renderFormField(fieldKey, fieldSchema)
                      )}
                    </div>
                  )
                })}
            </div>
          ) : (
            <div className="text-blue-200 text-center py-8">
              {schemaLoading ? '加载表单中...' : '加载表单失败'}
            </div>
          )}
        </div>
        <DialogFooter className="px-6 pb-6 pt-4 border-t border-blue-500/20 shrink-0 gap-2">
          <Button
            variant="outline"
            onClick={closeAllDialogs}
            disabled={submitting}
            className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]"
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_25px_rgba(34,211,238,0.5)] transition-all disabled:opacity-50"
          >
            {submitting ? '提交中...' : (editingId ? '保存' : '创建')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // 渲染查看弹窗
  const viewBoxDialog = () => (
    <Dialog open={isViewOpen} onOpenChange={(open) => {
      if (!open) closeAllDialogs()
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] !flex !flex-col !p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-blue-500/20 shrink-0">
          <DialogTitle className="text-white">{tableName}详情</DialogTitle>
          <DialogDescription className="text-blue-200">
            查看{tableName}的详细信息
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar min-h-0">
          {viewingRecord && schema?.schema?.properties ? (
            <div className="grid gap-4">
              {schema.schema.form?.map((fieldKey: string) => {
                const fieldSchema = schema.schema?.properties?.[fieldKey]
                const fieldTitle = fieldSchema?.title || fieldKey
                const value = viewingRecord[fieldKey]

                if (value === undefined || value === null || value === '') {
                  return null
                }

                let displayValue: React.ReactNode
                if (fieldSchema?.enum1) {
                  const enumValues = fieldSchema.enum1
                  const enumTitles = fieldSchema.enum_title1
                  const index = enumValues.indexOf(value)
                  if (index !== -1 && enumTitles && enumTitles[index]) {
                    displayValue = enumTitles[index]
                  } else {
                    displayValue = value
                  }
                } else if (typeof value === 'object') {
                  if (value.name) {
                    displayValue = value.name
                  } else if (value.id) {
                    displayValue = value.id
                  } else {
                    displayValue = JSON.stringify(value)
                  }
                } else {
                  displayValue = String(value)
                }

                return (
                  <div key={fieldKey}>
                    <Label className="text-blue-300">{fieldTitle}</Label>
                    <p className="font-medium text-white mt-1">
                      {displayValue}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-blue-200 text-center py-8">
              暂无详情
            </div>
          )}
        </div>
        <DialogFooter className="px-6 pb-6 pt-4 border-t border-blue-500/20 shrink-0">
          <Button onClick={closeAllDialogs} className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500">
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // 返回所有需要的状态和方法
  return {
    // 数据
    data,
    loading,
    pagination,
    schema,
    schemaLoading,
    searchText,
    filters,

    // 操作
    setSearchText,
    setFilter,
    reload,
    reset,
    changePage,
    changePageSize,
    handleSubmit,

    // 弹窗
    isCreateOpen,
    isEditOpen,
    isViewOpen,
    editingId,
    formData,
    submitting,
    openCreate,
    openEdit,
    openView,
    closeAllDialogs,

    // 渲染方法
    renderSearchBar,
    renderTable,
    renderFormDialog,
    viewBoxDialog,

    // 配置
    pageTitle,
    tableName,
    tableId,
  }
}
