import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ViewModel from '@/components/kesi/view-model/view-model'
import { ViewDataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import ViewFilter from '@/components/kesi/view-filter/view-filter'
import Actions, { CreateAction } from '@/components/kesi/view-actions/view-actions'
import { Badge } from '@/components/ui/badge'

const tableId = '工时核销'

const PageContent = () => {
  return (
    <>
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4 mb-4" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <ViewFilter 
              filters={[
                { key: 'approval-code', name: '核销单号' },
                { key: 'work-order', name: '工单号' },
                { key: 'employee', name: '员工' },
                { key: 'status', name: '状态' },
              ]} 
              classNames={{ form: 'flex flex-row items-end gap-4 flex-wrap w-full', group: 'flex flex-row items-end gap-4 flex-1 min-w-0', field: 'w-auto', label: 'text-blue-200 whitespace-nowrap', input: 'bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50 w-auto', description: '', error: '' }} 
            />
          </div>
          <div className="flex gap-2 items-center pt-4">
            <Button variant="outline" className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20">刷新</Button>
            <CreateAction modelId={tableId}><Button className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">+ 新建核销申请</Button></CreateAction>
          </div>
        </div>
      </Card>
      <ViewDataTable 
        tableLayout={{ border: true, headerSticky: true, columnsResizable: true, stripped: true, dense: false }}
      >
        <TableColumn name="approval-code" title="核销单号" width={150} />
        <TableColumn name="work-order" title="工单号" width={150} />
        <TableColumn name="process" title="工序" width={120} />
        <TableColumn name="employee" title="员工" width={100} />
        <TableColumn name="employee-code" title="员工编号" width={100} />
        <TableColumn name="work-date" title="工作日期" width={120} />
        <TableColumn name="work-hours" title="工时" width={80} />
        <TableColumn name="overtime-hours" title="加班工时" width={100} />
        <TableColumn name="piece-count" title="计件数量" width={100} />
        <TableColumn name="unit-price" title="计件单价" width={100} />
        <TableColumn name="total-amount" title="金额" width={100} />
        <TableColumn name="applicant" title="申请人" width={100} />
        <TableColumn name="apply-date" title="申请日期" width={120} />
        <TableColumn name="status" title="审批状态" width={100}>
          {(props) => {
            const value = props.value
            const colorMap: Record<string, string> = {
              '待审批': 'bg-yellow-500/20 text-yellow-400',
              '审批中': 'bg-blue-500/20 text-blue-400',
              '已通过': 'bg-green-500/20 text-green-400',
              '已驳回': 'bg-red-500/20 text-red-400',
              '已核销': 'bg-purple-500/20 text-purple-400',
            }
            return (
              <Badge className={colorMap[value] || 'bg-gray-500/20 text-gray-400'}>
                {value || '-'}
              </Badge>
            )
          }}
        </TableColumn>
        <TableColumn name="__actions__" title="操作" fixed="right" width={130}>{(props) => <Actions item={props.item} actions={['view', 'edit', 'delete']} variant="buttons" />}</TableColumn>
      </ViewDataTable>
      <div className="p-4"><ViewPagination showTotal={true} showSizeChanger={true} showQuickJumper={true} pageSizeOptions={[10, 20, 50, 100]} /></div>
    </>
  )
}

export function WorkTimeApprovalPage() {
  return <div className="space-y-0"><ViewModel tableId={tableId} initQuery={true}><PageContent /></ViewModel>
    </div>
  }

export default WorkTimeApprovalPage
