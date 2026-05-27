import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toastApi } from '@/components/ui/toast'
import { formatDateTime } from '@/lib/utils'

import ViewModel from '@/components/kesi/view-model/view-model'
import { ViewDataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import ViewFilter from '@/components/kesi/view-filter/view-filter'
import { useModelList } from '@airiot/client'

import {
  getScheduleStatusColor,
  getAlertLevelColor,
} from '@/services/scheduling.service'

const tableId = '排程计划'

/** 计算剩余天数 */
const getRemainingDays = (deliveryDate: string): number => {
  if (!deliveryDate) return 0
  const delivery = new Date(deliveryDate)
  const today = new Date()
  return Math.ceil((delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

const PageContent: React.FC = () => {
  const { items } = useModelList()

  // ===== 统计卡片 =====
  const stats = useMemo(() => {
    if (!items || !Array.isArray(items)) return { normal: 0, warning: 0, overdue: 0, adjusted: 0 }
    return {
      normal: items.filter((item: any) => item['select-status'] === '正常').length,
      warning: items.filter((item: any) => item['select-status'] === '预警').length,
      overdue: items.filter((item: any) => item['select-status'] === '超期').length,
      adjusted: items.filter((item: any) => item['select-status'] === '已调整').length,
    }
  }, [items])

  // ===== Dialog 状态 =====
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isPlanView, setIsPlanView] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rescheduleForm, setRescheduleForm] = useState({
    plannedStart: '',
    plannedEnd: '',
    remark: '',
  })

  // ===== 事件处理 =====
  const handleViewAlert = (item: any) => {
    setSelectedItem(item)
    setIsPlanView(false)
    setIsViewDialogOpen(true)
  }

  const handleViewPlan = (item: any) => {
    setSelectedItem(item)
    setIsPlanView(true)
    setIsViewDialogOpen(true)
  }

  const handleOpenReschedule = (item: any) => {
    setSelectedItem(item)
    setRescheduleForm({ plannedStart: '', plannedEnd: '', remark: '' })
    setIsRescheduleDialogOpen(true)
  }

  const handleReschedule = async () => {
    if (!selectedItem) return
    if (!rescheduleForm.plannedStart || !rescheduleForm.plannedEnd) {
      toastApi.error('请填写新的计划日期')
      return
    }
    setSubmitting(true)
    try {
      // TODO: 调用重排产API
      toastApi.success('重排产成功')
      setIsRescheduleDialogOpen(false)
    } catch (error: any) {
      toastApi.error(error.message || '重排产失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* ===== 统计卡片 ===== */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <div className="p-4 text-center">
            <p className="text-blue-200 text-sm">正常订单</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.normal}</p>
          </div>
        </Card>
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(250, 173, 20, 0.4)' }}>
          <div className="p-4 text-center">
            <p className="text-yellow-300 text-sm">预警订单</p>
            <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.warning}</p>
          </div>
        </Card>
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(255, 77, 79, 0.4)' }}>
          <div className="p-4 text-center">
            <p className="text-red-300 text-sm">超期订单</p>
            <p className="text-3xl font-bold text-red-400 mt-1">{stats.overdue}</p>
          </div>
        </Card>
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <div className="p-4 text-center">
            <p className="text-blue-200 text-sm">已调整</p>
            <p className="text-3xl font-bold text-blue-400 mt-1">{stats.adjusted}</p>
          </div>
        </Card>
      </div>

      {/* ===== 周期预警列表 ===== */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <div className="flex justify-between items-center gap-4 flex-wrap mb-4">
          <h3 className="text-lg font-semibold text-white">周期预警列表</h3>
        </div>
        <ViewFilter
          filters={[
            { key: 'alert-level' },
            { key: 'select-status' },
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
        <div className="mt-4">
          <ViewDataTable tableLayout={{ border: true, headerSticky: true, columnsResizable: true, stripped: true, dense: false }}>
            <TableColumn name="serial-number" title="订单号" width={150}>
              {(props: any) => <span className="font-medium text-cyan-300">{props.value || '-'}</span>}
            </TableColumn>
            <TableColumn name="customer-order-no" title="客户订单号" width={150} />
            <TableColumn name="quantity" title="计划数量" width={100} />
            <TableColumn name="delivery-date" title="计划交付日期" width={130}>
              {(props: any) => <span>{formatDateTime(props.value)}</span>}
            </TableColumn>
            <TableColumn name="__remaining_days__" title="剩余天数" width={100}>
              {(props: any) => {
                const days = getRemainingDays(props.item?.['delivery-date'])
                return <span className={days < 3 ? 'text-red-400 font-bold' : ''}>{days}天</span>
              }}
            </TableColumn>
            <TableColumn name="completed-rate" title="完成率" width={130}>
              {(props: any) => {
                const rate = Number(props.value) || 0
                const color = rate >= 80 ? '#52c41a' : rate >= 50 ? '#faad14' : '#ff4d4f'
                return (
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-xs text-slate-300 w-10 text-right">{rate}%</span>
                  </div>
                )
              }}
            </TableColumn>
            <TableColumn name="select-status" title="状态" width={100}>
              {(props: any) => {
                const status = props.value
                return (
                  <Badge className="px-2 py-1 rounded text-sm font-medium" style={{
                    backgroundColor: `${getScheduleStatusColor(status)}20`,
                    color: getScheduleStatusColor(status),
                    borderColor: getScheduleStatusColor(status),
                  }}>
                    {status || '-'}
                  </Badge>
                )
              }}
            </TableColumn>
            <TableColumn name="alert-level" title="预警级别" width={100}>
              {(props: any) => {
                const level = props.value
                return (
                  <Badge className="px-2 py-1 rounded text-sm font-medium" style={{
                    backgroundColor: `${getAlertLevelColor(level)}20`,
                    color: getAlertLevelColor(level),
                    borderColor: getAlertLevelColor(level),
                  }}>
                    {level || '-'}
                  </Badge>
                )
              }}
            </TableColumn>
            <TableColumn name="suggested-action" title="建议操作" width={200}>
              {(props: any) => (
                <span className="text-sm text-slate-300 max-w-[200px] truncate block" title={props.value}>
                  {props.value || '-'}
                </span>
              )}
            </TableColumn>
            <TableColumn name="__actions__" title="操作" fixed="right" width={130}>
              {(props: any) => (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleViewAlert(props.item)} className="text-blue-300 hover:text-white hover:bg-blue-500/20">查看</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleOpenReschedule(props.item)} className="text-cyan-300 hover:text-white hover:bg-cyan-500/20">重排产</Button>
                </div>
              )}
            </TableColumn>
          </ViewDataTable>
        </div>
        <div className="p-4">
          <ViewPagination showTotal={true} showSizeChanger={true} showQuickJumper={true} pageSizeOptions={[10, 20, 50]} />
        </div>
      </Card>

      {/* ===== 排产计划表 ===== */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <div className="flex justify-between items-center gap-4 flex-wrap mb-4">
          <h3 className="text-lg font-semibold text-white">排产计划表</h3>
        </div>

        {/* 图例 */}
        <div className="flex gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500/40 border border-green-500" />
            <span className="text-xs text-slate-300">已完成</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-500/40 border border-blue-500" />
            <span className="text-xs text-slate-300">进行中</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500/40 border border-red-500" />
            <span className="text-xs text-slate-300">延误</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-slate-500/40 border border-slate-500" />
            <span className="text-xs text-slate-300">未开始</span>
          </div>
        </div>

        <ViewDataTable tableLayout={{ border: true, headerSticky: true, stripped: true, columnsResizable: true }}>
          <TableColumn name="dispatch-no" title="派工单号" width={150}>
            {(props: any) => <span className="font-medium text-cyan-300">{props.value || '-'}</span>}
          </TableColumn>
          <TableColumn name="product-name" title="产品" width={150} />
          <TableColumn name="process-name" title="工序名称" width={120} />
          <TableColumn name="equipment-name" title="设备名称" width={120} />
          <TableColumn name="plan-start-time" title="计划开始时间" width={140}>
            {(props: any) => <span>{formatDateTime(props.value) || '-'}</span>}
          </TableColumn>
          <TableColumn name="plan-end-time" title="计划结束时间" width={140}>
            {(props: any) => <span>{formatDateTime(props.value) || '-'}</span>}
          </TableColumn>
          <TableColumn name="actual-start-time" title="实际开始时间" width={140}>
            {(props: any) => <span>{props.value ? formatDateTime(props.value) : '-'}</span>}
          </TableColumn>
          <TableColumn name="actual-end-time" title="实际结束时间" width={140}>
            {(props: any) => <span>{props.value ? formatDateTime(props.value) : '-'}</span>}
          </TableColumn>
          <TableColumn name="dispatch-status" title="派工状态" width={100}>
            {(props: any) => {
              const status = props.value
              const colorMap: Record<string, string> = {
                '延误': '#ff4d4f',
                '进行中': '#1890ff',
                '已完成': '#52c41a',
                '未开始': '#999',
              }
              const color = colorMap[status] || '#999'
              return (
                <Badge className="px-2 py-1 rounded text-sm font-medium" style={{
                  backgroundColor: `${color}20`,
                  color,
                  borderColor: color,
                }}>
                  {status || '-'}
                </Badge>
              )
            }}
          </TableColumn>
          <TableColumn name="__actions__" title="操作" fixed="right" width={100}>
            {(props: any) => (
              <Button size="sm" variant="ghost" onClick={() => handleViewPlan(props.item)} className="text-blue-300 hover:text-white hover:bg-blue-500/20">查看</Button>
            )}
          </TableColumn>
        </ViewDataTable>
      </Card>

      {/* ===== 查看详情 Dialog ===== */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] !flex !flex-col !p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-700 shrink-0">
            <DialogTitle className="text-slate-100">
              {isPlanView ? '排产计划详情' : '预警详情'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {isPlanView ? '查看排产计划详细信息' : '查看订单预警详情'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar min-h-0">
            {/* 预警详情 */}
            {selectedItem && !isPlanView && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">订单号</Label>
                  <p className="font-medium text-white">{selectedItem['serial-number'] || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">客户订单号</Label>
                  <p className="font-medium text-white">{selectedItem['customer-order-no'] || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">计划数量</Label>
                  <p className="font-medium text-white">{selectedItem['quantity'] || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">计划交付日期</Label>
                  <p className="font-medium text-white">{formatDateTime(selectedItem['delivery-date'])}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">剩余天数</Label>
                  <p className={`font-medium ${getRemainingDays(selectedItem['delivery-date']) < 3 ? 'text-red-400' : 'text-white'}`}>
                    {getRemainingDays(selectedItem['delivery-date'])}天
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">完成率</Label>
                  <p className="font-medium text-white">{selectedItem['completed-rate'] || 0}%</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">状态</Label>
                  <Badge className="px-2 py-1 rounded text-sm font-medium" style={{
                    backgroundColor: `${getScheduleStatusColor(selectedItem['select-status'])}20`,
                    color: getScheduleStatusColor(selectedItem['select-status']),
                    borderColor: getScheduleStatusColor(selectedItem['select-status']),
                  }}>
                    {selectedItem['select-status'] || '-'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">预警级别</Label>
                  <Badge className="px-2 py-1 rounded text-sm font-medium" style={{
                    backgroundColor: `${getAlertLevelColor(selectedItem['alert-level'])}20`,
                    color: getAlertLevelColor(selectedItem['alert-level']),
                    borderColor: getAlertLevelColor(selectedItem['alert-level']),
                  }}>
                    {selectedItem['alert-level'] || '-'}
                  </Badge>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-blue-200 text-sm">建议操作</Label>
                  <p className="font-medium text-white whitespace-pre-wrap">{selectedItem['suggested-action'] || '-'}</p>
                </div>
              </div>
            )}
            {/* 排产计划详情 */}
            {selectedItem && isPlanView && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">派工单号</Label>
                  <p className="font-medium text-cyan-300">{selectedItem['dispatch-no'] || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">产品</Label>
                  <p className="font-medium text-white">{selectedItem['product-name'] || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">工序名称</Label>
                  <p className="font-medium text-white">{selectedItem['process-name'] || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">设备名称</Label>
                  <p className="font-medium text-white">{selectedItem['equipment-name'] || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">计划开始时间</Label>
                  <p className="font-medium text-white">{formatDateTime(selectedItem['plan-start-time']) || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">计划结束时间</Label>
                  <p className="font-medium text-white">{formatDateTime(selectedItem['plan-end-time']) || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">实际开始时间</Label>
                  <p className="font-medium text-white">{selectedItem['actual-start-time'] ? formatDateTime(selectedItem['actual-start-time']) : '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">实际结束时间</Label>
                  <p className="font-medium text-white">{selectedItem['actual-end-time'] ? formatDateTime(selectedItem['actual-end-time']) : '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">派工状态</Label>
                  <Badge className="px-2 py-1 rounded text-sm font-medium" style={{
                    backgroundColor: `${
                      selectedItem['dispatch-status'] === '延误' ? '#ff4d4f' :
                      selectedItem['dispatch-status'] === '进行中' ? '#1890ff' :
                      selectedItem['dispatch-status'] === '已完成' ? '#52c41a' : '#999'
                    }20`,
                    color: selectedItem['dispatch-status'] === '延误' ? '#ff4d4f' :
                      selectedItem['dispatch-status'] === '进行中' ? '#1890ff' :
                        selectedItem['dispatch-status'] === '已完成' ? '#52c41a' : '#999',
                  }}>
                    {selectedItem['dispatch-status'] || '-'}
                  </Badge>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="px-6 pb-6 pt-4 border-t border-blue-500/20 shrink-0 gap-2">
            <Button onClick={() => setIsViewDialogOpen(false)} className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500">
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== 重排产 Dialog ===== */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] !flex !flex-col !p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-700 shrink-0">
            <DialogTitle className="text-slate-100">重排产</DialogTitle>
            <DialogDescription className="text-slate-400">调整订单的排产计划</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar min-h-0">
            {/* 订单信息 */}
            {selectedItem && (
              <div className="mb-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <h4 className="text-sm font-semibold text-blue-200 mb-3">订单信息</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-slate-400">订单号: </span>
                    <span className="text-cyan-300">{selectedItem['serial-number'] || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">客户订单号: </span>
                    <span className="text-white">{selectedItem['customer-order-no'] || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">计划交付日期: </span>
                    <span className="text-white">{formatDateTime(selectedItem['delivery-date'])}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">完成率: </span>
                    <span className="text-white">{selectedItem['completed-rate'] || 0}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400">当前状态: </span>
                    <Badge className="px-2 py-1 rounded text-sm font-medium" style={{
                      backgroundColor: `${getScheduleStatusColor(selectedItem['select-status'])}20`,
                      color: getScheduleStatusColor(selectedItem['select-status']),
                      borderColor: getScheduleStatusColor(selectedItem['select-status']),
                    }}>
                      {selectedItem['select-status'] || '-'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-slate-400">剩余天数: </span>
                    <span className={getRemainingDays(selectedItem['delivery-date']) < 3 ? 'text-red-400 font-bold' : 'text-white'}>
                      {getRemainingDays(selectedItem['delivery-date'])}天
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 重排产表单 */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="rs-planned-start" className="text-blue-200 text-sm">
                  新计划开始日期 <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="rs-planned-start"
                  type="date"
                  className="h-10 bg-blue-500/10 border-blue-400/30 text-white"
                  value={rescheduleForm.plannedStart}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, plannedStart: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rs-planned-end" className="text-blue-200 text-sm">
                  新计划结束日期 <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="rs-planned-end"
                  type="date"
                  className="h-10 bg-blue-500/10 border-blue-400/30 text-white"
                  value={rescheduleForm.plannedEnd}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, plannedEnd: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="rs-remark" className="text-blue-200 text-sm">调整原因</Label>
                <Textarea
                  id="rs-remark"
                  className="bg-blue-500/10 border-blue-400/30 text-white min-h-[80px]"
                  placeholder="请输入排产调整原因"
                  value={rescheduleForm.remark}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, remark: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 pt-4 border-t border-blue-500/20 shrink-0 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsRescheduleDialogOpen(false)}
              disabled={submitting}
              className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20"
            >
              取消
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={submitting}
              className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_4px_20px_rgba(59,130,246,0.4)]"
            >
              {submitting ? '提交中...' : '确认重排产'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function SchedulingPage() {
  return (
    <ViewModel tableId={tableId} initQuery={true}>
      <PageContent />
    </ViewModel>
  )
}
