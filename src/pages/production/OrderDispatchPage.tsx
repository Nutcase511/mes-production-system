// @ts-ignore
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useState } from 'react'
import { Zap, Settings } from 'lucide-react'

import ViewModel from '@/components/kesi/view-model/view-model'
import { ViewDataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import ViewFilter from '@/components/kesi/view-filter/view-filter'
import Actions, { CreateAction, ViewAction, EditAction, DeleteAction } from '@/components/kesi/view-actions/view-actions'
import { Eye, Edit, Trash2 } from 'lucide-react'

const tableId = '生产计划'

// 紧急插单对话框
const UrgentOrderDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>紧急插单</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-blue-200 text-sm">订单号</label>
            <input className="w-full mt-1 bg-blue-500/10 border border-blue-400/30 rounded px-3 py-2 text-white" placeholder="请输入订单号" />
          </div>
          <div>
            <label className="text-blue-200 text-sm">优先级</label>
            <select className="w-full mt-1 bg-blue-500/10 border border-blue-400/30 rounded px-3 py-2 text-white">
              <option value="urgent">紧急</option>
              <option value="high">高</option>
              <option value="normal">普通</option>
            </select>
          </div>
          <div>
            <label className="text-blue-200 text-sm">原因说明</label>
            <textarea className="w-full mt-1 bg-blue-500/10 border border-blue-400/30 rounded px-3 py-2 text-white" rows={3} placeholder="请说明紧急原因" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="text-blue-200 border-blue-400/30">取消</Button>
          <Button className="bg-gradient-to-r from-orange-400 to-red-400">确认插单</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 手动调整对话框
const ManualAdjustDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>手动调整</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-blue-200 text-sm">派工单号</label>
              <input className="w-full mt-1 bg-blue-500/10 border border-blue-400/30 rounded px-3 py-2 text-white" placeholder="请输入派工单号" />
            </div>
            <div>
              <label className="text-blue-200 text-sm">调整类型</label>
              <select className="w-full mt-1 bg-blue-500/10 border border-blue-400/30 rounded px-3 py-2 text-white">
                <option value="reschedule">重新排程</option>
                <option value="reassign">重新分配</option>
                <option value="priority">调整优先级</option>
                <option value="resource">资源调整</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-blue-200 text-sm">原值</label>
              <input className="w-full mt-1 bg-blue-500/10 border border-blue-400/30 rounded px-3 py-2 text-white" placeholder="原值" />
            </div>
            <div>
              <label className="text-blue-200 text-sm">新值</label>
              <input className="w-full mt-1 bg-blue-500/10 border border-blue-400/30 rounded px-3 py-2 text-white" placeholder="新值" />
            </div>
          </div>
          <div>
            <label className="text-blue-200 text-sm">调整原因</label>
            <textarea className="w-full mt-1 bg-blue-500/10 border border-blue-400/30 rounded px-3 py-2 text-white" rows={3} placeholder="请说明调整原因" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="text-blue-200 border-blue-400/30">取消</Button>
          <Button className="bg-gradient-to-r from-blue-400 to-cyan-400">确认调整</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const OrderDispatchContent: React.FC = () => {
  const [showUrgentDialog, setShowUrgentDialog] = useState(false)
  const [showManualDialog, setShowManualDialog] = useState(false)
  
  return (
    <>
      <UrgentOrderDialog isOpen={showUrgentDialog} onClose={() => setShowUrgentDialog(false)} />
      <ManualAdjustDialog isOpen={showManualDialog} onClose={() => setShowManualDialog(false)} />
      
      {/* 过滤器卡片 */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4 mb-4" style={{
        borderColor: 'rgba(59, 130, 246, 0.3)'
      }}>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <ViewFilter
              filters={[
                { key: 'dispatch-no', name: 'dispatch-no' },
                { key: 'work-order-no', name: 'work-order-no' },
                { key: 'dispatch-status', name: 'dispatch-status' },
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
            <Button 
              variant="outline" 
              className="text-orange-300 border-orange-500/60 hover:bg-orange-500/20"
              onClick={() => setShowUrgentDialog(true)}
            >
              <Zap className="w-4 h-4 mr-1" />
              紧急插单
            </Button>
            <Button 
              variant="outline" 
              className="text-purple-300 border-purple-500/60 hover:bg-purple-500/20"
              onClick={() => setShowManualDialog(true)}
            >
              <Settings className="w-4 h-4 mr-1" />
              手动调整
            </Button>
            <Button variant="outline" className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20">刷新</Button>
            <CreateAction modelId={tableId}>
              <Button className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                + 新建计划
              </Button>
            </CreateAction>
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
        <TableColumn name="dispatch-no" title="派工单号" width={150} />
        <TableColumn name="work-order-no" title="工单号" width={150} />
        <TableColumn name="product-code" title="产品代号" width={120} />
        <TableColumn name="process-name" title="工序名称" width={150} />
        <TableColumn name="dispatch-qty" title="派工数量" width={100} />
        <TableColumn name="operator" title="操作工" width={100} />
        <TableColumn name="equipment" title="设备" width={120} />
        <TableColumn name="dispatch-status" title="状态" width={100}>
          {(props) => {
            const value = props.value
            const colorMap: Record<string, string> = {
              '已派工': 'bg-blue-500/20 text-blue-400',
              '进行中': 'bg-yellow-500/20 text-yellow-400',
              '已完成': 'bg-green-500/20 text-green-400',
              '已关闭': 'bg-gray-500/20 text-gray-400',
            }
            return (
              <Badge className={colorMap[value] || 'bg-gray-500/20 text-gray-400'}>
                {value || '-'}
              </Badge>
            )
          }}
        </TableColumn>
        <TableColumn name="plan-start" title="计划开始" width={120} />
        <TableColumn name="plan-end" title="计划结束" width={120} />
        <TableColumn name="__actions__" title="操作" fixed="right" width={100}>
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
      </ViewDataTable>

      <div className="p-4">
        <ViewPagination showTotal={true} showSizeChanger={true} showQuickJumper={true} pageSizeOptions={[10, 20, 50, 100]} />
      </div>
    </>
  )
}

export function OrderDispatchPage() {
  return (
    <div className="space-y-0">
      <ViewModel tableId={tableId} initQuery={true}>
          <OrderDispatchContent />
        </ViewModel>
    </div>
  )
}

export default OrderDispatchPage
