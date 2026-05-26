import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import ViewModel from '@/components/kesi/view-model/view-model'
import { ViewDataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import ViewFilter from '@/components/kesi/view-filter/view-filter'

const tableId = '库存总表'

const InventoryAlertContent: React.FC = () => {
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
                { key: 'material-code'},
                { key: 'alert-type'},
                { key: 'alert-level'},
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
        <TableColumn name="material-code" title="物料编码" width={120} />
        <TableColumn name="material-name" title="物料名称" width={180} />
        <TableColumn name="warehouse" title="仓库" width={120} />
        <TableColumn name="current-qty" title="当前库存" width={100} />
        <TableColumn name="safety-stock" title="安全库存" width={100} />
        <TableColumn name="alert-type" title="预警类型" width={120}>
          {(props) => {
            const value = props.value
            const colorMap: Record<string, string> = {
              '库存不足': 'bg-red-500/20 text-red-400',
              '库存超量': 'bg-orange-500/20 text-orange-400',
              '即将过期': 'bg-yellow-500/20 text-yellow-400',
            }
            return (
              <Badge className={colorMap[value] || 'bg-gray-500/20 text-gray-400'}>
                {value || '-'}
              </Badge>
            )
          }}
        </TableColumn>
        <TableColumn name="alert-level" title="预警级别" width={100}>
          {(props) => {
            const value = props.value
            const colorMap: Record<string, string> = {
              '紧急': 'bg-red-500/20 text-red-400',
              '重要': 'bg-orange-500/20 text-orange-400',
              '一般': 'bg-yellow-500/20 text-yellow-400',
            }
            return (
              <Badge className={colorMap[value] || 'bg-gray-500/20 text-gray-400'}>
                {value || '-'}
              </Badge>
            )
          }}
        </TableColumn>
        <TableColumn name="alert-time" title="预警时间" width={160} />
        <TableColumn name="status" title="处理状态" width={100}>
          {(props) => {
            const value = props.value
            const colorMap: Record<string, string> = {
              '未处理': 'bg-red-500/20 text-red-400',
              '处理中': 'bg-yellow-500/20 text-yellow-400',
              '已处理': 'bg-green-500/20 text-green-400',
            }
            return (
              <Badge className={colorMap[value] || 'bg-gray-500/20 text-gray-400'}>
                {value || '-'}
              </Badge>
            )
          }}
        </TableColumn>
      </ViewDataTable>

      <div className="p-4">
        <ViewPagination showTotal={true} showSizeChanger={true} showQuickJumper={true} pageSizeOptions={[10, 20, 50, 100]} />
      </div>
    </>
  )
}

export function InventoryAlertPage() {
  return (
    <div className="space-y-0">
      <ViewModel tableId={tableId} initQuery={true}>
          <InventoryAlertContent />
        </ViewModel>
    </div>
  )
}

export default InventoryAlertPage
