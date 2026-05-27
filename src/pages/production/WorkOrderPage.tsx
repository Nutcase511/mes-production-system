import React, { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useModel, useModelGetItems, createAPI } from '@airiot/client'
import { useModelListWithOptions } from '@/hooks/useModelListSafe'

import ViewModel from '@/components/kesi/view-model/view-model'
import { ViewDataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import { ViewFilter } from '@/components/kesi/view-filter/view-filter'
import Actions, { CreateAction, ViewAction, EditAction, DeleteAction } from '@/components/kesi/view-actions/view-actions'
import { Eye, Edit, Trash2 } from 'lucide-react'
import ProcessRecordView from '@/components/ProcessRecordView'
import { List } from 'lucide-react'
import { LoadingDots } from '@/components/ui/loading-dots'

const tableId = '生产跟单'

const filterFields = [
  {
    key: 'batchOrderNo',
    name: 'batchOrderNo',
    title: '生产令号',
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
    key: 'productionStatus',
    name: 'productionStatus',
    title: '生产状态',
    fieldType: 'filter_enum',
    enum1: ['0', '1', '2', '3', '4', '5', '6'],
    enum_title1: ['未开始', '待试产', '试产通过', '试产完成', '生产中', '生产完成', '生产中(正式)'],
    orientation: 'horizontal' as const,
  },
  {
    key: 'preparationStatus',
    name: 'preparationStatus',
    title: '准备状态',
    fieldType: 'filter_enum',
    enum1: ['1', '2'],
    enum_title1: ['待检查', '已完成'],
    orientation: 'horizontal' as const,
  },
]

// WorkOrderContent 组件
const WorkOrderContent: React.FC = () => {
  const { model } = useModel()
  const { items, loading } = useModelListWithOptions({ initQuery: false })
  const { getItems } = useModelGetItems()



  // 从 model.form 获取字段顺序
  const fieldOrder = useMemo(() => {
    const form = model?.form
    if (!form || !Array.isArray(form)) {
      return []
    }

    // form 是字符串数组，每个元素就是字段名
    // 如果是对象数组，提取 id 或 key；如果是字符串数组，直接使用
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
    const enumFields = ['productType', 'preparationStatus', 'productionStatus', 'materialStatus', 'firstCheckResult', 'finalCheckResult', 'inboundStatus']

    // 需要显示为关联字段的列
    const relateFields = ['pid', 'relatedProductionNoticeNo', 'productionPlan']

    // 获取所有属性定义（model 本身就是 schema，properties 在 model.properties）
    const allProps = model?.properties || {}

    // 按照 fieldOrder 生成列
    fieldOrder.forEach((fieldId: string) => {
      const fieldSchema = allProps[fieldId]
      if (!fieldSchema) {
        return
      }

      // 跳过不在表格中展示的字段
      if (fieldId === 'partProductionRecords' || fieldId === 'orderFollowLog') {
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
                // 如果关联数据是对象，提取 notificationNumber 或 name
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
        } else if (fieldId === 'pid') {
          // pid 字段显示关联对象的 planNumber
          columns.push(
            <TableColumn
              key={fieldId}
              name={fieldId}
              title={fieldTitle}
              width={180}
            >
              {(props) => {
                const relateData = props.value
                // 如果关联数据是对象，提取 planNumber 或 name
                if (relateData && typeof relateData === 'object') {
                  return (
                    <span className="text-blue-200">
                      {relateData.planNumber || relateData.name || '-'}
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

      // 普通字段（固定宽度）
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
      <TableColumn name="__actions__" title="操作" fixed="right" width={180} key="__actions__">
        {(props) => (
          <div className="flex gap-1">
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => handleViewProcessRecord(props.item)}
              title="查看工序记录"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableColumn>
    )

    return columns
  }, [fieldOrder, model])

  // 工序记录查看状态
  const [showProcessRecordDialog, setShowProcessRecordDialog] = useState(false)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null)

  // 查看工序记录
  const handleViewProcessRecord = (item: any) => {
    setSelectedWorkOrder(item)
    setShowProcessRecordDialog(true)
  }

  return (
    <>
      {/* 过滤器 */}
      <ViewFilter
        filters={filterFields.map(f => ({ key: f.name }))}
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

      {/* 数据表格 */}
      {loading ? (
        <LoadingDots text="加载中..." />
      ) : (
        <>
          <ViewDataTable
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
            gridOptions={{}}
          >
            {tableColumns}
          </ViewDataTable>

          <div className="p-4">
            <ViewPagination showTotal={true} showSizeChanger={true} showQuickJumper={true} pageSizeOptions={[10, 20, 50, 100]} />
          </div>
        </>
      )}

      {/* 工序记录查看对话框 */}
      <Dialog open={showProcessRecordDialog} onOpenChange={setShowProcessRecordDialog}>
        <DialogContent className="!w-[800px] !max-w-none max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">工序记录</DialogTitle>
            <DialogDescription className="text-blue-200">
              生产令号: {selectedWorkOrder?.batchComponentSerialNumber || selectedWorkOrder?.batchOrderNo || '-'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ProcessRecordView
              processRecord={selectedWorkOrder?.orderFollowLog}
              showQuantityStats={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function WorkOrderPage() {
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
          <WorkOrderContent />
        </ViewModel>
    </div>
  )
}

export default WorkOrderPage
