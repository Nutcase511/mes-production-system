// @ts-ignore
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import ViewModel from '@/components/kesi/view-model/view-model'
import { ViewDataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import ViewFilter from '@/components/kesi/view-filter/view-filter'
import Actions, { CreateAction, ViewAction, EditAction, DeleteAction } from '@/components/kesi/view-actions/view-actions'
import { Eye, Edit, Trash2 } from 'lucide-react'

const tableId = '库存总表'

const InventoryTransactionContent: React.FC = () => {
  return (
    <>
      {/* 过滤器卡片 */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4 mb-4" style={{
        borderColor: 'rgba(59, 130, 246, 0.3)'
      }}>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <ViewFilter
              filters={[
                { key: 'transaction-no', name: 'transaction-no' },
                { key: 'material-code', name: 'material-code' },
                { key: 'transaction-type', name: 'transaction-type' },
              ]}
              classNames={{
                form: 'flex flex-row items-end gap-4 flex-wrap w-full',
                group: 'flex flex-row items-end gap-4 flex-1 min-w-0',
                field: 'w-auto',
                label: 'text-blue-200 whitespace-nowrap',
                input: 'bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50 w-auto',
                description: '',
                error: '',
              }}
            />
          </div>
          <div className="flex gap-2 items-center pt-4">
            <Button variant="outline" className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20">刷新</Button>
          </div>
        </div>
      </Card>

      {/* 数据表格 */}
      <ViewDataTable
        tableLayout={{
          border: true,
          headerSticky: true,
          columnsResizable: true,
          stripped: true,
          dense: false,
        }}
      >
        <TableColumn name="transaction-no" title="事务编号" width={150} />
        <TableColumn name="transaction-type" title="事务类型" width={100}>
          {(props) => {
            const value = props.value
            const colorMap: Record<string, string> = {
              '入库': 'bg-green-500/20 text-green-400',
              '出库': 'bg-red-500/20 text-red-400',
              '调拨': 'bg-blue-500/20 text-blue-400',
              '盘点': 'bg-yellow-500/20 text-yellow-400',
              '报废': 'bg-gray-500/20 text-gray-400',
            }
            return (
              <Badge className={colorMap[value] || 'bg-gray-500/20 text-gray-400'}>
                {value || '-'}
              </Badge>
            )
          }}
        </TableColumn>
        <TableColumn name="material-code" title="物料编码" width={120} />
        <TableColumn name="material-name" title="物料名称" width={180} />
        <TableColumn name="warehouse" title="仓库" width={120} />
        <TableColumn name="location" title="库位" width={120} />
        <TableColumn name="quantity-change" title="数量变化" width={100} />
        <TableColumn name="before-qty" title="变化前" width={100} />
        <TableColumn name="after-qty" title="变化后" width={100} />
        <TableColumn name="transaction-date" title="事务时间" width={160} />
        <TableColumn name="operator" title="操作人" width={100} />
        <TableColumn name="reference-no" title="关联单号" width={150} />
        <TableColumn name="__actions__" title="操作" fixed="right" width={100}>
          {(props) => (
            <div className="flex items-center gap-1">
            <ViewAction itemId={props.item.id}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
            </ViewAction>
          </div>
          )}
        </TableColumn>
      </ViewDataTable>

      <div className="p-4">
        <ViewPagination showTotal={true} showSizeChanger={true} showQuickJumper={true} pageSizeOptions={[10, 20, 50, 100]} />
      </div>
    </>
  )
}

export function InventoryTransactionPage() {
  return (
    <div className="space-y-0">
      <ViewModel tableId={tableId} initQuery={true}>
          <InventoryTransactionContent />
        </ViewModel>
    </div>
  )
}

export default InventoryTransactionPage
