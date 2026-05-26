import React, { useEffect, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingDots } from '@/components/ui/loading-dots'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { useModel, useModelState, useModelGetItems, useModelList, createAPI } from '@airiot/client'
import { useModelListWithOptions } from '@/hooks/useModelListSafe'
import _ from 'lodash'

// 从本地 airiot 组件导入
import ViewModel from '@/components/kesi/view-model/view-model'
import { DataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import { CreateAction, ViewAction, EditAction, DeleteAction } from '@/components/kesi/view-actions/view-actions'
import FilterSchemaForm from '@/components/kesi/filter-form/filter-form'
import { useAuth } from '@/contexts/AuthContext'

// 关联真实 AIRIOT 表
const tableId = '投产通知单'

// 指定的过滤字段（不依赖 model.properties 自动生成）
const filterFields = [
  {
    key: 'issueDate',
    name: 'issueDate',
    title: '下达日期',
    fieldType: 'filter_single_date',
    orientation: 'horizontal' as const,
  },
  {
    key: 'orderPriority',
    name: 'orderPriority',
    title: '订单优先级',
    fieldType: 'filter_enum',
    enum1: ['高', '中', '低'],
    enum_title1: ['高', '中', '低'],
    orientation: 'horizontal' as const,
  },
]

// 表格内容组件（必须在 TableView 内部）
const ProductionNoticeContent: React.FC = () => {
  const { model } = useModel()
  const { items, loading } = useModelListWithOptions({ initQuery: false })
  const [wheres, setWheres] = useModelState('wheres')
  const { getItems } = useModelGetItems()

  // 从 model.form 获取字段顺序
  const fieldOrder = useMemo(() => {
    const form = model?.form
    if (!form || !Array.isArray(form)) {
      return []
    }

    const order = form.map((field: any) => {
      if (typeof field === 'string') {
        return field
      }
      return field.id || field.key
    })

    return order
  }, [model])

  // 动态生成表格列
  const tableColumns = useMemo(() => {
    const columns: React.ReactElement[] = []

    // 需要特殊渲染的枚举字段（显示为带颜色的 Badge）
    const enumFields = ['orderType', 'orderPriority', 'select-2ECC']

    // 需要特殊处理的用户字段（显示 name 属性）
    const userFields = ['creator', 'receiveBy']

    // 获取所有属性定义
    const allProps = model?.properties || {}

    // 按照 fieldOrder 生成列
    fieldOrder.forEach((fieldId: string) => {
      const fieldSchema = allProps[fieldId]
      if (!fieldSchema) {
        return
      }

      const fieldTitle = fieldSchema.title || fieldSchema.name || fieldId

      // 用户字段（显示 name 属性）
      if (userFields.includes(fieldId)) {
        columns.push(
          <TableColumn
            key={fieldId}
            name={fieldId}
            title={fieldTitle}
          >
            {(props) => {
              const value = props.value
              return <span className="text-blue-200">{value?.name || value || '-'}</span>
            }}
          </TableColumn>
        )
        return
      }

      // 枚举字段（带颜色的 Badge）
      if (enumFields.includes(fieldId)) {
        columns.push(
          <TableColumn key={fieldId} name={fieldId} title={fieldTitle}>
            {(props) => {
              const value = props.value
              const currentFieldSchema = allProps[fieldId]

              const enumValues = currentFieldSchema?.enum1 || []
              const enumColors = currentFieldSchema?.enum_color1 || []
              const enumTitles = currentFieldSchema?.enum_title1 || []

              const index = enumValues.indexOf(String(value))
              const title = index >= 0 ? enumTitles[index] : value
              const color = index >= 0 ? enumColors[index] : '#d1d5db'

              return (
                <div className="flex justify-center">
                  <Badge style={{ backgroundColor: color, color: '#ffffff', fontWeight: 500 }}>
                    {title || value || '-'}
                  </Badge>
                </div>
              )
            }}
          </TableColumn>
        )
        return
      }

      // 普通字段
      columns.push(
        <TableColumn
          key={fieldId}
          name={fieldId}
          title={fieldTitle}
        />
      )
    })

    // 添加操作列
    columns.push(
      <TableColumn name="__actions__" title="操作" fixed="right" width={160} key="__actions__">
        {(props) => {
          const item = props.item
          return (
            <TooltipProvider>
              <div className="flex items-center justify-center gap-0.5">
                <ViewAction itemId={item.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-200 hover:text-cyan-300 hover:bg-blue-500/20">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-blue-900 border-blue-400/30 text-blue-100 text-xs">查看</TooltipContent>
                  </Tooltip>
                </ViewAction>
                <EditAction itemId={item.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-200 hover:text-cyan-300 hover:bg-blue-500/20">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-blue-900 border-blue-400/30 text-blue-100 text-xs">编辑</TooltipContent>
                  </Tooltip>
                </EditAction>
                <DeleteAction itemId={item.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-red-900/90 border-red-400/30 text-red-100 text-xs">删除</TooltipContent>
                  </Tooltip>
                </DeleteAction>
              </div>
            </TooltipProvider>
          )
        }}
      </TableColumn>
    )

    return columns
  }, [fieldOrder, model])

  const properties = _.mapValues(model.properties || {}, (prop, key) => ({ ...prop, name: key }))

  // 初始化查询
  const initializedRef = useRef(false)
  useEffect(() => {
    if (model?.properties && !initializedRef.current) {
      initializedRef.current = true
      const fields = Object.keys(model.properties)
      const query = {
        fields: fields,
        withCount: true
      }
      getItems(query)
    }
  }, [model])

  const onSubmit = (value: any) => {
    const newWheres = { ...(wheres || {}), filter: { ...(wheres?.filter || {}), ...value } }
    setWheres(newWheres)
    getItems({ projectAll: true })
  }

  const onReset = (reset: () => void) => {
    reset()
    const newWheres = { ...(wheres || {}), filter: {} }
    setWheres(newWheres)
    getItems({ projectAll: true })
  }

  return (
    <>
      {/* 过滤器 + 操作栏 */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4 mb-4" style={{
        borderColor: 'rgba(59, 130, 246, 0.3)'
      }}>
        <FilterSchemaForm
          formId="production-notice-filter"
          schema={{ ...model, properties }}
          filterSchema={filterFields}
          onSubmit={onSubmit}
          classNames={{
            form: 'flex flex-row items-end gap-4 w-full',
            group: '!flex !flex-row !items-end !gap-4',
            field: '!flex !flex-row !items-center !gap-2 !w-auto',
            label: 'text-blue-200 whitespace-nowrap !w-[90px] !flex-none text-sm',
            input: '!w-auto !min-w-[240px]',
            description: '',
            error: '',
            }}
        >
          {(methods) => (
            <div className="flex items-center gap-2">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 h-9 text-sm">
                搜索
              </Button>
              <Button type="button" variant="outline" className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20 px-4 py-1.5 h-9 text-sm" onClick={() => onReset(methods.reset)}>
                重置
              </Button>
              <CreateAction>
                <Button className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] px-4 py-1.5 h-9 text-sm">
                  + 新建通知
                </Button>
              </CreateAction>
            </div>
          )}
        </FilterSchemaForm>
      </Card>

      {/* 数据表格 */}
      {loading ? (
        <LoadingDots />
      ) : (
        <DataTable
          data={items as any[]}
          tableLayout={{
            border: true,
            headerSticky: true,
            columnsPinnable: true,
            columnsResizable: false,
            stripped: true,
            dense: false,
            width: 'auto',
          }}
          tableOptions={{
            initialState: {
              columnPinning: {
                right: ['__actions__']
              }
            }
          }}
          gridOptions={{}}
        >
          {tableColumns}
        </DataTable>
      )}

      <div className="p-4">
        <ViewPagination
          showTotal={true}
          showSizeChanger={true}
          showQuickJumper={true}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </div>
    </>
  )
}

export function ProductionNoticePage() {
  const { user } = useAuth()
  const [queryFields, setQueryFields] = React.useState<string[] | undefined>(undefined)

  React.useEffect(() => {
    createAPI({ resource: `core/t/schema/${encodeURIComponent(tableId)}` }).fetch('')
      .then((res: any) => {
        const schema = res?.json?.schema || res?.json || res?.schema || res
        if (schema?.properties) {
          setQueryFields(Object.keys(schema.properties))
        }
      })
  }, [])

  return (
    <div className="space-y-0">
      <ViewModel
          tableId={tableId}
          initQuery={false}
          queryFields={queryFields}
        >
          <ProductionNoticeContent />
        </ViewModel>
    </div>
  )
}