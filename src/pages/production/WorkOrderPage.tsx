// @ts-ignore
import { useState, useEffect, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useModel, useSetModelState, useModelGetItems, useModelList } from '@airiot/client'
import _ from 'lodash'

import ViewModel from '@/components/kesi/view-model/view-model'
import { DataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import ViewFilter from '@/components/kesi/view-filter/view-filter'
import Actions, { CreateAction } from '@/components/kesi/view-actions/view-actions'
import ProcessRecordView from '@/components/ProcessRecordView'
import { List } from 'lucide-react'
import { LoadingDots } from '@/components/ui/loading-dots'

const tableId = '生产跟单'

// WorkOrderContent 组件
const WorkOrderContent: React.FC = () => {
  const { model } = useModel()
  const { items, loading } = useModelList({ initQuery: false })
  const { getItems } = useModelGetItems()

  // 从 model.form 获取字段顺序（model 本身就是 schema）
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
    const columns: React.ReactNode[] = []

    // 需要特殊渲染的枚举字段（显示为带颜色的 Badge）
    const enumFields = ['productType', 'preparationStatus', 'productionStatus', 'materialStatus', 'firstCheckResult', 'finalCheckResult', 'inboundStatus']

    // 需要显示为关联字段的列
    const relateFields = ['pid', 'relatedProductionNoticeNo']

    // 获取所有属性定义（model 本身就是 schema，properties 在 model.properties）
    const allProps = model?.properties || {}

    // 按照 fieldOrder 生成列
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
          // 其他关联字段使用默认渲染（如 pid）
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
            <Actions item={props.item} actions={['view', 'edit', 'delete']} variant="buttons" />
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

  // 初始化查询：从 schema 获取所有字段
  const initializedRef = useRef(false)
  useEffect(() => {
    if (model?.properties && !initializedRef.current) {
      initializedRef.current = true
      const fields = Object.keys(model.properties)

      // 构建查询参数
      const query = {
        fields: fields,  // 查询所有字段，包括 partProductionRecords 和 processRecord
        withCount: true,
      }

      getItems(query)
    }
  }, [model])

  // 查看工序记录
  const handleViewProcessRecord = (item: any) => {
    setSelectedWorkOrder(item)
    setShowProcessRecordDialog(true)
  }

  return (
    <>
      {/* 过滤器卡片 */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4 mb-4" style={{
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
          <div className="flex gap-2 items-center shrink-0">
            <CreateAction modelId={tableId}>
              <Button className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                + 新建跟单
              </Button>
            </CreateAction>
          </div>
        </div>
      </Card>

      {/* 数据表格 */}
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
              processRecord={selectedWorkOrder?.processRecord}
              showQuantityStats={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function WorkOrderPage() {
  return (
    <div className="space-y-0">
      <ViewModel tableId={tableId} initQuery={false}>
          <WorkOrderContent />
        </ViewModel>
    </div>
  )
}

export default WorkOrderPage
