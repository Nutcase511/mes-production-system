// @ts-ignore
import React, { useEffect, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingDots } from '@/components/ui/loading-dots'
import { useModel, useModelState, useModelGetItems, useModelList, createAPI } from '@airiot/client'
import _ from 'lodash'
import ViewModel from '@/components/kesi/view-model/view-model'
import { DataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import Actions, { CreateAction, ViewAction, EditAction, DeleteAction } from '@/components/kesi/view-actions/view-actions'
import { Eye, Edit, Trash2 } from 'lucide-react'
import FilterSchemaForm from '@/components/kesi/filter-form/filter-form'
const tableId = '生产计划'

const filterFields = [
  {
    key: 'orderNo',
    name: 'orderNo',
    title: '计划编号',
    fieldType: 'filter_string',
    orientation: 'horizontal' as const,
  },
  {
    key: 'productName',
    name: 'productName',
    title: '产品名称',
    fieldType: 'filter_string',
    orientation: 'horizontal' as const,
  },
  {
    key: 'status',
    name: 'status',
    title: '派单状态',
    fieldType: 'filter_enum',
    enum1: ['待下发', '已下发', '生产中', '已完成', '已取消'],
    enum_title1: ['待下发', '已下发', '生产中', '已完成', '已取消'],
    orientation: 'horizontal' as const,
  },
]

const OrderListContent: React.FC = () => {
  const { model } = useModel()
  const { items, loading } = useModelList({ initQuery: false })
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
    const columns: React.ReactNode[] = []

    // 需要特殊渲染的枚举字段（显示为带颜色的 Badge）
    const enumFields = ['select-0362', 'status']

    // 需要特殊渲染的关联字段
    const relateFields = ['relatedProductionNoticeNo']

    // 获取所有属性定义
    const allProps = model?.properties || {}

    // 按照 fieldOrder 生成列
    fieldOrder.forEach((fieldId: string) => {
      const fieldSchema = allProps[fieldId]
      if (!fieldSchema) {
        return
      }

      const fieldTitle = fieldSchema.title || fieldSchema.name || fieldId

      // 关联字段（relatedProductionNoticeNo）
      if (relateFields.includes(fieldId)) {
        columns.push(
          <TableColumn
            key={fieldId}
            name={fieldId}
            title={fieldTitle}
            width={180}
          >
            {(props) => {
              const relateData = props.value
              // 如果关联数据是对象，提取 notificationNumber
              if (relateData && typeof relateData === 'object') {
                return (
                  <span className="text-blue-200">
                    {relateData.notificationNumber || relateData.name || '-'}
                  </span>
                )
              }
              return <span className="text-blue-200">{relateData || '-'}</span>
            }}
          </TableColumn>
        )
        return
      }

      // 枚举字段（带颜色的 Badge）
      if (enumFields.includes(fieldId)) {
        columns.push(
          <TableColumn key={fieldId} name={fieldId} title={fieldTitle} width={120}>
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
      const columnWidth = fieldId === 'orderNo' ? 150 : 120
      const fixed = fieldId === 'orderNo' ? 'left' : undefined

      columns.push(
        <TableColumn
          key={fieldId}
          name={fieldId}
          title={fieldTitle}
          width={columnWidth}
          fixed={fixed}
        />
      )
    })

    // 添加操作列
    columns.push(
      <TableColumn name="__actions__" title="操作" fixed="right" width={100} key="__actions__">
        {(props) => (
          <div className="flex items-center gap-1">
            <ViewAction itemId={props.item.id}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
            </ViewAction>
            <EditAction itemId={props.item.id}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
            </EditAction>
            <DeleteAction itemId={props.item.id}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DeleteAction>
          </div>
        )}
      </TableColumn>
    )

    return columns
  }, [fieldOrder, model])

  const properties = _.mapValues(model.properties || {}, (prop, key) => ({ ...prop, name: key }))

  // 初始化查询：从 schema 获取所有字段
  const initializedRef = useRef(false)
  useEffect(() => {
    if (model?.properties && !initializedRef.current) {
      initializedRef.current = true
      const fields = Object.keys(model.properties)

      // 构建查询参数
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
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4 mb-4" style={{
        borderColor: 'rgba(59, 130, 246, 0.3)'
      }}>
        <FilterSchemaForm
          formId="order-list-filter"
          schema={{ ...model, properties }}
          formSchema={filterFields}
          onSubmit={onSubmit}
          classNames={{
            form: 'flex flex-row items-end gap-4 w-full',
            group: '!flex !flex-row !items-end !gap-4',
            field: '!flex !flex-row !items-center !gap-2 !w-auto',
            label: 'text-blue-200 whitespace-nowrap !w-[90px] !flex-none text-sm',
            input: '!w-auto !min-w-[240px]',
            description: '',
            error: '',
            orientation: 'horizontal',
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
              <CreateAction modelId={tableId}>
                <Button className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] px-4 py-1.5 h-9 text-sm">
                  + 新建派单
                </Button>
              </CreateAction>
            </div>
          )}
        </FilterSchemaForm>
      </Card>

      {loading ? (
        <LoadingDots />
      ) : (
        <DataTable
          data={items as any[]}
          tableLayout={{
            border: true,
            headerSticky: true,
            columnsResizable: true,
            columnsPinnable: true,
            stripped: true,
            dense: false,
          }}
          tableOptions={{
            initialState: {
              columnPinning: {
                right: ['__actions__']
              }
            }
          }}
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

export function OrderListPage() {
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
      <ViewModel tableId={tableId} initQuery={true} queryFields={queryFields}>
        <OrderListContent />
      </ViewModel>
    </div>
  )
}
