import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusTag } from '@/components/StatusTag'
import { formatDateTime } from '@/lib/utils'
import type { WorkOrder } from '@/types/production'

interface WorkOrderCardProps {
  workOrder: WorkOrder
  onClick?: (workOrder: WorkOrder) => void
  onReport?: (workOrder: WorkOrder) => void
  onDetail?: (workOrder: WorkOrder) => void
}

export function WorkOrderCard({ workOrder, onClick, onReport, onDetail }: WorkOrderCardProps) {
  return (
    <Card
      className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4 cursor-pointer hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
      style={{
        borderColor: 'rgba(59, 130, 246, 0.3)'
      }}
      onClick={() => onClick?.(workOrder)}
    >
      <CardHeader className="p-0 mb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-white drop-shadow-md">{workOrder.woId}</h3>
            <p className="text-sm text-blue-200">{workOrder.productName}</p>
          </div>
          <StatusTag status={workOrder.status} />
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-blue-300">工序:</span>
            <span className="ml-2 text-white">{workOrder.processName}</span>
          </div>
          <div>
            <span className="text-blue-300">设备:</span>
            <span className="ml-2 text-white">{workOrder.equipment}</span>
          </div>
          <div>
            <span className="text-blue-300">操作工:</span>
            <span className="ml-2 text-white">{workOrder.operator}</span>
          </div>
          <div>
            <span className="text-blue-300">投入:</span>
            <span className="ml-2 text-white">{workOrder.inputQty}</span>
          </div>
        </div>

        {workOrder.startTime && (
          <div className="text-sm">
            <span className="text-blue-300">开始时间:</span>
            <span className="ml-2 text-white">{formatDateTime(workOrder.startTime)}</span>
          </div>
        )}

        <div className="pt-2 border-t border-blue-400/20 flex gap-2">
          <Button
            size="sm"
            variant="default"
            className="flex-1 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
            onClick={(e) => {
              e.stopPropagation()
              // TODO: 批量生产功能
            }}
          >
            批量生产
          </Button>
          <Button
            size="sm"
            variant="default"
            className="flex-1 bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
            onClick={(e) => {
              e.stopPropagation()
              onReport?.(workOrder)
            }}
          >
            报工
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-blue-100 border-blue-400/40 hover:bg-blue-500/10"
            onClick={(e) => {
              e.stopPropagation()
              onDetail?.(workOrder)
            }}
          >
            {workOrder.status === '进行中' ? '暂停' : workOrder.status === '暂停中' ? '继续' : '详情'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
