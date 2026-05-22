import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ViewModel from '@/components/kesi/view-model/view-model'
import { ViewDataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import ViewFilter from '@/components/kesi/view-filter/view-filter'
import Actions, { CreateAction, ViewAction, EditAction, DeleteAction } from '@/components/kesi/view-actions/view-actions'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const tableId = '库存总表'

const PageContent = () => {
  return (
    <>
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4 mb-4" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <ViewFilter 
              filters={[
                { key: 'transfer-code', name: '调拨单号' },
                { key: 'material-code', name: '物料编码' },
                { key: 'from-warehouse', name: '调出仓库' },
                { key: 'to-warehouse', name: '调入仓库' },
                { key: 'status', name: '状态' },
              ]} 
              classNames={{ form: 'flex flex-row items-end gap-4 flex-wrap w-full', group: 'flex flex-row items-end gap-4 flex-1 min-w-0', field: 'w-auto', label: 'text-blue-200 whitespace-nowrap', input: 'bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50 w-auto', description: '', error: '' }} 
            />
          </div>
          <div className="flex gap-2 items-center pt-4">
            <Button variant="outline" className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20">刷新</Button>
            <CreateAction modelId={tableId}><Button className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">+ 新建调拨单</Button></CreateAction>
          </div>
        </div>
      </Card>
      <ViewDataTable 
        tableLayout={{ border: true, headerSticky: true, columnsResizable: true, stripped: true, dense: false }}
      >
        <TableColumn name="transfer-code" title="调拨单号" width={150} />
        <TableColumn name="material-code" title="物料编码" width={120} />
        <TableColumn name="material-name" title="物料名称" width={180} />
        <TableColumn name="specification" title="规格型号" width={150} />
        <TableColumn name="quantity" title="调拨数量" width={100} />
        <TableColumn name="unit" title="单位" width={80} />
        <TableColumn name="from-warehouse" title="调出仓库" width={120} />
        <TableColumn name="from-location" title="调出库位" width={120} />
        <TableColumn name="to-warehouse" title="调入仓库" width={120} />
        <TableColumn name="to-location" title="调入库位" width={120} />
        <TableColumn name="applicant" title="申请人" width={100} />
        <TableColumn name="apply-date" title="申请日期" width={120} />
        <TableColumn name="status" title="调拨状态" width={100}>
          {(props) => {
            const value = props.value
            const colorMap: Record<string, string> = {
              '待审核': 'bg-yellow-500/20 text-yellow-400',
              '审核通过': 'bg-blue-500/20 text-blue-400',
              '调拨中': 'bg-purple-500/20 text-purple-400',
              '已完成': 'bg-green-500/20 text-green-400',
              '已取消': 'bg-red-500/20 text-red-400',
            }
            return (
              <Badge className={colorMap[value] || 'bg-gray-500/20 text-gray-400'}>
                {value || '-'}
              </Badge>
            )
          }}
        </TableColumn>
        <TableColumn name="__actions__" title="操作" fixed="right" width={100}>{(props) => <div className="flex items-center gap-1">
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
          </div>}</TableColumn>
      </ViewDataTable>
      <div className="p-4"><ViewPagination showTotal={true} showSizeChanger={true} showQuickJumper={true} pageSizeOptions={[10, 20, 50, 100]} /></div>
    </>
  )
}

export function WarehouseCoordinationPage() {
  return <div className="space-y-0"><ViewModel tableId={tableId} initQuery={true}><PageContent /></ViewModel>
    </div>
  }

export default WarehouseCoordinationPage
