// @ts-ignore
import { useState, useEffect, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ViewModel from '@/components/kesi/view-model/view-model'
import { DataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import Actions, { CreateAction } from '@/components/kesi/view-actions/view-actions'
import { useModel, useModelState, useModelGetItems, useModelList } from '@airiot/client'
import { LoadingDots } from '@/components/ui/loading-dots'
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
]

const OutsourcingProgressContent: React.FC = () => {
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
    const enumFields = ['productType', 'preparationStatus', 'productionStatus', 'materialStatus', 'firstCheckResult', 'finalCheckResult', 'inboundStatus', 'select-0362']

    // 需要显示为关联字段的列（关联投产通知单）
    const relateFields = ['relatedProductionNoticeNo']

    const allProps = model?.properties || {}

    fieldOrder.forEach((fieldId: string) => {
      const fieldSchema = allProps[fieldId]
      if (!fieldSchema) {
        return
      }

      // 跳过不在表格中展示的字段
      if (fieldId === 'partProductionRecords' || fieldId === 'processRecord') {
        return
      }

      const fieldTitle = fieldSchema.title || fieldSchema.name || fieldId

      // 关联字段
      if (relateFields.includes(fieldId)) {
        // 特殊处理 relatedProductionNoticeNo 字段，显示 notificationNumber
        if (fieldId === 'relatedProductionNoticeNo') {
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
        } else {
          // 其他关联字段使用默认渲染
          columns.push(
            <TableColumn
              key={fieldId}
              name={fieldId}
              title={fieldTitle}
              type="relate"
              width={150}
              schema={fieldSchema}
            />
          )
        }
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
      const columnWidth = fieldId === 'name' ? 120 : 150
      columns.push(
        <TableColumn
          key={fieldId}
          name={fieldId}
          title={fieldTitle}
          width={columnWidth}
        />
      )
    })

    // 添加操作列
    columns.push(
      <TableColumn name="__actions__" title="操作" fixed="right" width={130} key="__actions__">
        {(props) => <Actions item={props.item} actions={['view', 'edit', 'delete']} variant="buttons" />}
      </TableColumn>
    )

    return columns
  }, [fieldOrder, model])

  // 初始化查询：只查询外协类型的跟单（select-0362 = '1'）
  const initializedRef = useRef(false)
  useEffect(() => {
    if (model?.properties && !initializedRef.current) {
      initializedRef.current = true
      // const fields = Object.keys(model.properties)

      // const query = {
      //   fields: fields,
      //   filters: [
      //     {
      //       field: 'select-0362',
      //       operator: 'eq',
      //       value: '1'
      //     }
      //   ],
      //   withCount: true,
      // }
      // getItems(query)
    }
  }, [])

  const onSubmit = (value: any) => {
    const newWheres = { ...(wheres || {}), filter: { ...(wheres?.filter || {}), ...value } }
    setWheres(newWheres)
    const query = {
      filters: [
        {
          field: 'select-0362',
          operator: 'eq',
          value: '1'
        }
      ]
    }
    getItems(query)
  }

  const onReset = (reset: () => void) => {
    reset()
    setWheres({ ...(wheres || {}), filter: {} })
    const query = {
      filters: [
        {
          field: 'select-0362',
          operator: 'eq',
          value: '1'
        }
      ]
    }
    getItems(query)
  }

  return (
    <>
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4 mb-4" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <FilterSchemaForm
          formId="outsourcing-progress-filter"
          schema={{ ...model, properties: model?.properties || {} }}
          formSchema={filterFields}
          onSubmit={onSubmit}
          classNames={{
            form: 'flex flex-row items-end gap-4 flex-wrap w-full',
            group: 'flex flex-row items-end gap-4 flex-1 min-w-0',
            field: 'w-auto',
            label: 'text-blue-200 whitespace-nowrap',
            input: 'bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50 w-auto',
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
              <CreateAction modelId={tableId}>
                <Button className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] px-4 py-1.5 h-9 text-sm">
                  + 新建外协计划
                </Button>
              </CreateAction>
            </div>
          )}
        </FilterSchemaForm>
      </Card>

      {loading ? (
        <LoadingDots text="加载中..." />
      ) : (
        <>
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

          <div className="p-4"><ViewPagination showTotal={true} showSizeChanger={true} showQuickJumper={true} pageSizeOptions={[10, 20, 50, 100]} /></div>
        </>
      )}
    </>
  )
}

export function OutsourcingProgressPage() {
  return <div className="space-y-0"><ViewModel tableId={tableId} initQuery={false}><OutsourcingProgressContent /></ViewModel></div>
}
