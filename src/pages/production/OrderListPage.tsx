import React, { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingDots } from '@/components/ui/loading-dots'
import { useModel, createAPI } from '@airiot/client'
import ViewModel from '@/components/kesi/view-model/view-model'
import { ViewDataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import Actions, { CreateAction, ViewAction, EditAction, DeleteAction } from '@/components/kesi/view-actions/view-actions'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { ViewFilter } from '@/components/kesi/view-filter/view-filter'
const tableId = '生产计划'

const filterFields = [
  { key: 'orderNo' },
  { key: 'productName' },
  { key: 'planState' },
]

const OrderListContent: React.FC = () => {
  const { model } = useModel()

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
    const enumFields = ['select-0362', 'planState']

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

  return (
    <>
      {/* 过滤器 */}
      <ViewFilter
        filters={filterFields}
        classNames={{
          form: 'flex flex-row items-end gap-4 flex-wrap w-full',
          group: 'flex flex-row items-end gap-4 flex-1 min-w-0',
          field: 'w-auto',
          label: 'text-blue-200 whitespace-nowrap',
          input: 'bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50 w-auto',
          description: '',
          error: ''
        }}
      />

      <ViewDataTable
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
          gridOptions={{}}
        >
          {tableColumns}
      </ViewDataTable>

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
