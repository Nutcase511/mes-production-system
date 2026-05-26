/**
 * 调度路线页面
 * 左侧：调度路线列表
 * 右侧：路线详情 + 工序编辑（新增/编辑/删除/排序）
 */

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList, useModelSave, useModelGetItems, useModel , createAPI } from '@airiot/client'
import { useModelListWithOptions } from '@/hooks/useModelListSafe'
import { toast } from 'sonner'
import ViewFilter from '@/components/kesi/view-filter/view-filter'
import SchemaForm from '@/components/kesi/schema-form/schema-form'
import { useFormSchema } from '@/lib/form-schema-hooks'
import {
  CheckCircle,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Settings,
  FileText,
} from 'lucide-react'
import { LoadingDots } from '@/components/ui/loading-dots'

// 生产跟单表 - 需要显示的字段配置
const DISPLAY_FIELDS = [
  { key: 'batchComponentSerialNumber', label: '所属批次零部组件出厂编号' },
  { key: 'batchOrderNo', label: '批次令号' },
  { key: 'operationGuide', label: '操作指导书' },
  { key: 'productName', label: '产品名称' },
  { key: 'productCode', label: '产品代号' },
  { key: 'productType', label: '产品类型' },
]

const tableId = '生产跟单'

// 工序表单组件
interface ProcessRecordFormProps {
  formData: Record<string, any>
  setFormData: (data: Record<string, any>) => void
  editingIdx: number | null
  processRecordFields: { form: string[], properties: Record<string, any> }
  onSubmit: (data?: any) => void
  onCancel: () => void
}

const ProcessRecordForm: React.FC<ProcessRecordFormProps> = ({
  formData,
  setFormData,
  editingIdx,
  processRecordFields,
  onSubmit,
  onCancel
}) => {
  // 构建 formSchema，不使用 orientation，让字段作为 grid 的直接子元素
  const enhancedFormSchema = useMemo(() => {
    return (processRecordFields.form || []).map((fieldKey: string) => ({
      key: fieldKey,
      classNames: {
        field: 'contents flex flex-col gap-1',
        label: 'text-xs text-blue-200 whitespace-nowrap min-w-[80px]',
        input: 'bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50 w-full'
      }
    }))
  }, [processRecordFields.form])

  const handleSubmit = (data: any) => {
    setFormData(data)
    onSubmit(data)
  }

  return (
    <div className="p-4 border border-blue-400/30 rounded-lg bg-blue-500/10 mb-3">
      <SchemaForm
        formId="process-record-form"
        schema={{
          type: 'object',
          properties: processRecordFields.properties
        }}
        formSchema={enhancedFormSchema}
        defaultValues={formData}
        onSubmit={handleSubmit}
        classNames={{
          form: 'contents',
          group: 'grid grid-cols-3 gap-x-4 gap-y-2',
          field: 'contents',
          label: 'text-xs text-blue-200 whitespace-nowrap',
          input: 'bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50',
          description: 'text-xs text-blue-300/70',
          error: 'text-red-400 text-xs'
        }}
      >
        <div className="flex gap-2 col-span-3 mt-2">
          <Button
            size="sm"
            type="submit"
            className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500"
          >
            {editingIdx !== null ? '保存' : '添加'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={onCancel}
            className="text-blue-200 border-blue-400/30 hover:bg-blue-500/20"
          >
            取消
          </Button>
        </div>
      </SchemaForm>
    </div>
  )
}

const RouteListContent: React.FC = () => {
  const { model } = useModel()
  const { items, loading: modelLoading } = useModelListWithOptions({ initQuery: false })
  const { saveItem } = useModelSave()
  const { getItems } = useModelGetItems()

  // 获取 processRecord 字段配置
  const processRecordFields = useMemo(() => {
    const tableFields = model?.properties?.processRecord?.tableFields
    if (!tableFields) return { form: [], properties: {} }

    // 排除不需要在表单中显示的字段（使用实际字段名称）
    const excludedFields = ['outOfToleranceQuantity', 'inspectorStamp', 'operator', 'scrapQuantity']
    const filteredForm = (tableFields.form || []).filter((field: string) => !excludedFields.includes(field))

    // 同时过滤 properties，只保留过滤后的字段
    const filteredProperties: Record<string, any> = {}
    filteredForm.forEach((fieldKey: string) => {
      if (tableFields.properties[fieldKey]) {
        filteredProperties[fieldKey] = tableFields.properties[fieldKey]
      }
    })

    return {
      form: filteredForm,
      properties: filteredProperties
    }
  }, [model])

  const [selectedId, setSelectedId] = useState<string>('')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [dataItems, setDataItems] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const hasInitialized = useRef(false)

  // 新增工序弹窗状态
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

  // 工序配置锁定状态
  const [processConfigLocked, setProcessConfigLocked] = useState<Record<string, boolean>>({})

  // 确保 routes 始终是数组
  const routes: any[] = Array.isArray(dataItems) ? dataItems : []
  const loading = dataLoading

  // 检查工序配置是否锁定
  const isCurrentRouteLocked = selectedItem?.id && processConfigLocked[selectedItem.id]

  // 构建工序表单的虚拟 schema
  const processRecordSchema = useMemo(() => ({
    type: 'object',
    title: '工序',
    key: 'processRecord',
    properties: processRecordFields.properties
  }), [processRecordFields.properties])

  // 手动查询数据（排除关联字段）
  const initializedRef = useRef(false)
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const fetchData = async () => {
      if (!model) return

      // 从 model.form 中排除关联字段
      const formFields = model?.form || []
      const filteredFields = formFields.filter((field: string) =>
        field !== 'pid' && field !== 'productionOrderNo' && field !== 'parentWorkOrderID'
      )

      // 构建查询参数（参考生产跟单页面）
      const query = {
        fields: filteredFields,
        withCount: true,
      }

      setDataLoading(true)
      try {
        const result = await getItems(query)
        setDataItems(result?.items || [])
      } catch (e) {
        // Silently handle query errors
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [model, getItems])

  // 初始化选择第一个
  useEffect(() => {
    if (!hasInitialized.current && routes.length > 0 && !selectedId) {
      const first = routes[0]
      const id = first.id || first._id || first['serial-number']
      setSelectedId(id)
      setSelectedItem(first)
      hasInitialized.current = true
    }
  }, [routes, selectedId])

  useEffect(() => {
    if (selectedId && routes.length > 0) {
      const found = routes.find(r => (r.id || r._id || r['serial-number']) === selectedId)
      if (found && found !== selectedItem) {
        setSelectedItem(found)
      }
    }
  }, [selectedId, routes])

  // 初始化锁定状态
  useEffect(() => {
    if (selectedItem && selectedItem.id) {
      const isLocked = selectedItem.processConfigLocked === true ||
                       selectedItem.processConfigLocked === 'true'
      setProcessConfigLocked(prev => ({
        ...prev,
        [selectedItem.id]: isLocked
      }))
    }
  }, [selectedItem])

  // 渲染字段值
  const renderFieldValue = (value: any, fieldKey: string) => {
    if (value === null || value === undefined) return '-'

    // 处理附件类型（操作指导书）
    if (fieldKey === 'operationGuide') {
      if (Array.isArray(value) && value.length > 0) {
        return value.map((file: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-blue-300 hover:text-cyan-300 cursor-pointer">
              {file.name || `文件${idx + 1}`}
            </span>
          </div>
        ))
      }
      return typeof value === 'string' ? value : '-'
    }

    // 处理数组类型
    if (Array.isArray(value)) {
      return value.join(', ')
    }

    // 处理对象类型
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }

    return String(value)
  }

  // 渲染工序记录字段值
  const renderProcessRecordFieldValue = (value: any, fieldKey: string) => {
    if (value === null || value === undefined) return '-'
    return String(value)
  }

  // 保存工序记录到记录
  const saveProcesses = async (item: any, processRecord: any[]) => {
    try {
      await saveItem({
        ...item,
        processRecord,
      })
      // 刷新数据
      const query = {
        fields: model?.form?.filter((field: string) =>
          field !== 'pid' && field !== 'productionOrderNo' && field !== 'parentWorkOrderID'
        ) || [],
        withCount: true,
      }
      const result = await getItems(query)
      setDataItems(result?.items || [])
      toast.success('保存成功')
    } catch (e) {
      toast.error('保存失败')
    }
  }

  // 新增工序
  const handleAdd = (data?: any) => {
    const finalData = data || formData
    if (!finalData.processName?.trim()) {
      toast.error('请输入工序名称')
      return
    }

    const procRecord = [...(selectedItem.processRecord || [])]

    // 自动生成工序编号
    const newRecord: any = { ...finalData }
    if (!newRecord.processNo) {
      newRecord.processNo = `OP${procRecord.length * 10 + 10}`
    }

    procRecord.push(newRecord)
    saveProcesses(selectedItem, procRecord)
    resetForm()
  }

  // 编辑工序
  const handleEdit = (idx: number) => {
    const p = selectedItem.processRecord?.[idx]
    if (!p) return
    setEditingIdx(idx)
    setFormData({ ...p })
  }

  const handleEditSave = (data?: any) => {
    if (editingIdx === null || !selectedItem) return

    const finalData = data || formData
    if (!finalData.processName?.trim()) {
      toast.error('请输入工序名称')
      return
    }

    const procRecord = [...(selectedItem.processRecord || [])]
    procRecord[editingIdx] = { ...finalData }
    saveProcesses(selectedItem, procRecord)
    resetForm()
  }

  // 删除工序
  const handleDelete = (idx: number) => {
    const procRecord = selectedItem.processRecord || []
    const newRecord = procRecord.filter((_: any, i: number) => i !== idx)
    saveProcesses(selectedItem, newRecord)
  }

  // 上移 / 下移
  const handleMove = (idx: number, dir: -1 | 1) => {
    const procRecord = selectedItem.processRecord || []
    const newRecord = [...procRecord]
    const target = idx + dir
    if (target < 0 || target >= newRecord.length) return
    ;[newRecord[idx], newRecord[target]] = [newRecord[target], newRecord[idx]]
    saveProcesses(selectedItem, newRecord)
  }

  const resetForm = () => {
    setShowAddForm(false)
    setEditingIdx(null)
    setFormData({})
  }

  // 锁定工序配置
  const handleLockProcessConfig = async () => {
    if (!selectedItem) return

    // 验证工序配置完整性
    const processRecord = selectedItem.processRecord || []
    if (processRecord.length === 0) {
      toast.error('请先添加工序')
      return
    }

    // 检查每个工序是否都有设备
    const missingEquipment = processRecord.some((p: any) => !p.equipment)
    if (missingEquipment) {
      toast.error('请为所有工序指定设备')
      return
    }

    // 检查每个工序是否都有工序名称
    const missingProcessName = processRecord.some((p: any) => !p.processName)
    if (missingProcessName) {
      toast.error('请为所有工序填写工序名称')
      return
    }

    try {
      // 保存锁定状态到跟单
      const updatedItem = await saveItem({
        ...selectedItem,
        processConfigLocked: true,
      })

      // 更新本地状态
      setProcessConfigLocked({
        ...processConfigLocked,
        [selectedItem.id]: true
      })

      // 更新 selectedItem
      setSelectedItem(updatedItem)

      toast.success('工序配置已锁定，其他页面将只能追加操作记录')

      // 刷新列表数据
      const query = {
        fields: model?.form?.filter((field: string) =>
          field !== 'pid' && field !== 'productionOrderNo' && field !== 'parentWorkOrderID'
        ) || [],
        withCount: true,
      }
      const result = await getItems(query)
      setDataItems(result?.items || [])
    } catch (error) {
      toast.error('锁定失败')
    }
  }

  // 解锁工序配置
  const handleUnlockProcessConfig = async () => {
    if (!selectedItem) return

    try {
      const updatedItem = await saveItem({
        ...selectedItem,
        processConfigLocked: false,
      })

      setProcessConfigLocked({
        ...processConfigLocked,
        [selectedItem.id]: false
      })

      setSelectedItem(updatedItem)

      toast.success('工序配置已解锁')

      // 刷新列表数据
      const query = {
        fields: model?.form?.filter((field: string) =>
          field !== 'pid' && field !== 'productionOrderNo' && field !== 'parentWorkOrderID'
        ) || [],
        withCount: true,
      }
      const result = await getItems(query)
      setDataItems(result?.items || [])
    } catch (error) {
      toast.error('解锁失败')
    }
  }

  return (
    <div className="space-y-4">
      {/* 过滤器卡片 */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4" style={{
        borderColor: 'rgba(59, 130, 246, 0.3)'
      }}>
        <div className="flex flex-row items-end gap-4 flex-wrap w-full">
          <ViewFilter
            classNames={{
              form: 'flex flex-row items-end gap-4 flex-wrap flex-1 min-w-0',
              group: 'flex flex-row items-end gap-4 flex-1 min-w-0',
              field: 'flex flex-row items-center gap-2 w-auto',
              label: 'text-blue-200 whitespace-nowrap text-sm',
              input: 'bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50 min-w-[200px]',
              description: '',
              error: ''
            }}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" style={{ height: 'calc(100vh - 382px)' }}>
        {/* 左侧：调度路线列表 */}
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden flex flex-col h-full"
          style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <CardContent className="p-3 pt-3 flex-1 overflow-y-auto">
            {loading ? (
              <LoadingDots />
            ) : routes.length === 0 ? (
              <div className="text-center py-8 text-blue-200">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                <p>暂无调度路线</p>
              </div>
            ) : (
              <div className="space-y-2">
                {routes.slice(0, 10).map((r, index) => {
                  const id = r.id || r._id || r['serial-number'] || index
                  const name = r.processName || '未命名路线'
                  const product = r.productName || ''
                  return (
                    <div
                      key={id}
                      className={`p-2 border rounded-lg cursor-pointer transition-colors ${selectedId === id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-blue-400/30 bg-blue-500/5 hover:bg-blue-500/10'
                        }`}
                      onClick={() => setSelectedId(id)}
                    >
                      <div className="font-medium text-white text-sm">{name}</div>
                      {product && <div className="text-xs text-blue-200 truncate">{product}</div>}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 右侧：路线详情 */}
        <div className="lg:col-span-3 space-y-4">
          {selectedItem ? (
            <>
              {/* 调度路线信息 - 显示指定字段 */}
              <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
                style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-100 text-base">调度路线信息</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-6">
                  <div className="grid grid-cols-3 gap-4">
                    {DISPLAY_FIELDS.map(({ key, label }) => (
                      <div key={key}>
                        <p className="text-xs text-blue-300">{label}</p>
                        <div className="mt-0.5 text-white text-sm">
                          {renderFieldValue(selectedItem[key], key)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 工序记录 */}
              <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
                style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-blue-100 text-base flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    工序记录 ({selectedItem.processRecord?.length || 0})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {!showAddForm && editingIdx === null && !isCurrentRouteLocked && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => setShowAddForm(true)}
                          className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          新增工序
                        </Button>
                        {selectedItem.processRecord && selectedItem.processRecord.length > 0 && (
                          <Button
                            size="sm"
                            onClick={handleLockProcessConfig}
                            className="bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            工序配置完成
                          </Button>
                        )}
                      </>
                    )}
                    {isCurrentRouteLocked && (
                      <Badge className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        工序已锁定
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  {/* 新增/编辑表单 */}
                  {(showAddForm || editingIdx !== null) && (
                    <ProcessRecordForm
                      formData={formData}
                      setFormData={setFormData}
                      editingIdx={editingIdx}
                      processRecordFields={processRecordFields}
                      onSubmit={editingIdx !== null ? handleEditSave : handleAdd}
                      onCancel={resetForm}
                    />
                  )}

                  {/* 工序列表 */}
                  {selectedItem.processRecord && Array.isArray(selectedItem.processRecord) && selectedItem.processRecord.length > 0 ? (
                    selectedItem.processRecord.map((p: any, idx: number) => (
                      <div
                        key={p.processNo || idx}
                        className="p-3 border border-blue-400/30 rounded-lg bg-blue-500/5"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                            {processRecordFields.form.map((fieldKey: string) => {
                              const value = p[fieldKey]
                              const fieldSchema = processRecordFields.properties[fieldKey]
                              const fieldTitle = fieldSchema?.title || fieldSchema?.name || fieldKey

                              // 只显示有值的字段
                              if (value === null || value === undefined || value === '') return null

                              // 处理关联字段（设备）
                              if (fieldSchema?.relateTo && typeof value === 'object') {
                                return (
                                  <span key={fieldKey} className="text-xs text-blue-200 flex items-center gap-1 flex-shrink-0">
                                    {fieldTitle}: {value.name || value.equipmentName || value.code || '未指定'}
                                  </span>
                                )
                              }

                              return (
                                <div key={fieldKey} className="flex items-center gap-1">
                                  {fieldKey === 'processNo' ? (
                                    <Badge variant="outline" className="text-blue-300 border-blue-400/30 flex-shrink-0">
                                      {value}
                                    </Badge>
                                  ) : fieldKey === 'processName' ? (
                                    <span className="text-white text-sm font-medium truncate">{value}</span>
                                  ) : (
                                    <span className="text-xs text-blue-200 flex items-center gap-1 flex-shrink-0">
                                      {fieldTitle}: {value}
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!isCurrentRouteLocked && (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-blue-300 hover:text-blue-100"
                                  onClick={() => handleEdit(idx)}
                                  title="编辑"
                                >
                                  <Settings className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-blue-300 hover:text-blue-100"
                                  onClick={() => handleMove(idx, -1)}
                                  disabled={idx === 0}
                                  title="上移"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-blue-300 hover:text-blue-100"
                                  onClick={() => handleMove(idx, 1)}
                                  disabled={idx === selectedItem.processRecord.length - 1}
                                  title="下移"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-red-300 hover:text-red-100"
                                  onClick={() => handleDelete(idx)}
                                  title="删除"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            {isCurrentRouteLocked && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-orange-300 hover:text-orange-100"
                                onClick={handleUnlockProcessConfig}
                                title="解锁工序配置"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-blue-200">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-blue-300" />
                      <p>暂无工序记录</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
              style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <CardContent className="p-8 text-center text-blue-200">
                <p>请从左侧选择一条调度路线</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export function RouteListPage() {
  const [queryFields, setQueryFields] = React.useState<string[] | undefined>(undefined)

  React.useEffect(() => {
    createAPI({ resource: `core/t/schema/${encodeURIComponent(tableId)}` }).fetch('')
      .then((res: any) => {
        const schema = res?.schema || res
        if (schema?.properties) {
          setQueryFields(Object.keys(schema.properties))
        }
      })
  }, [])

  return (
    <div className="space-y-0">
      <ViewModel tableId={tableId} initQuery={false} queryFields={queryFields}>
        <RouteListContent />
      </ViewModel>
    </div>
  )
}

export default RouteListPage
