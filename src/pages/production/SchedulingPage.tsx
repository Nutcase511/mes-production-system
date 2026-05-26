import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { TableModel, useModelList, useModel } from '@airiot/client'
import { useModelListWithOptions } from '@/hooks/useModelListSafe'
import { DataTable } from '@/components/DataTable'
import { toastApi } from '@/components/ui/toast'
import { formatDateTime } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  getScheduleStatusColor,
  getAlertLevelColor,
  SCHEDULE_STATUS,
  ALERT_LEVEL,
} from '@/services/scheduling.service'
import type { ScheduleAlert, SchedulePlan } from '@/types/scheduling'

const tableId = '排程计划'

const PageContent: React.FC = () => {
  // 直接使用 useModelList 获取数据，不需要 TableView 包裹
  const { items, loading: modelLoading } = useModelListWithOptions({ initQuery: true })
  const { model } = useModel()

  // 从 schema 获取 form 数组，确定字段顺序
  const fieldOrder = useMemo(() => {
    if (!model?.schema?.form || !Array.isArray(model.schema.form)) return []
    return model.schema.form.map((field: any) => field.id)
  }, [model])

  // ===== Section A: Alert List State =====
  const [alerts, setAlerts] = useState<ScheduleAlert[]>([])
  const [alertsLoading, setAlertsLoading] = useState(false)
  const [alertsPagination, setAlertsPagination] = useState({
    current: 1,
    pageSize: 15,
    total: 0,
  })
  const [alertLevelFilter, setAlertLevelFilter] = useState('all')
  const [alertStatusFilter, setAlertStatusFilter] = useState('all')

  // ===== Section B: Plan Table State =====
  const [plans, setPlans] = useState<SchedulePlan[]>([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [plansPagination, setPlansPagination] = useState({
    current: 1,
    pageSize: 15,
    total: 0,
  })
  const [planSearchText, setPlanSearchText] = useState('')

  // ===== Dialog State =====
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<ScheduleAlert | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<SchedulePlan | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [rescheduleForm, setRescheduleForm] = useState({
    plannedStart: '',
    plannedEnd: '',
    remark: '',
  })

  // ===== Stats =====
  const [stats, setStats] = useState({
    normal: 0,
    warning: 0,
    overdue: 0,
    adjusted: 0,
  })

  // 使用 useModelList 获取的数据
  const scheduleData = useMemo(() => {
    if (!items || !Array.isArray(items)) return []
    return items.map((item: any) => ({
      id: item.id,
      orderNo: item.orderNo || item['serial-number'] || '',
      productName: item.productName || '',
      quantity: item.quantity || 0,
      deliveryDate: item.deliveryDate || new Date(),
      remainingDays: item.remainingDays || 0,
      completedRate: item.completedRate || 0,
      status: item.status || '未开始',
      alertLevel: item.alertLevel || '正常',
      suggestedAction: item.suggestedAction || '',
      plannedStart: item.plannedStart,
      plannedEnd: item.plannedEnd,
      actualStart: item.actualStart,
      actualEnd: item.actualEnd,
      processName: item.processName || '',
      equipmentName: item.equipmentName || '',
      _createTime: item._createTime || new Date().toISOString(),
      _updateTime: item._updateTime || new Date().toISOString(),
    }))
  }, [items])

  // 更新统计数据
  useEffect(() => {
    if (scheduleData.length > 0) {
      setStats({
        normal: scheduleData.filter((a: any) => a.status === '正常').length,
        warning: scheduleData.filter((a: any) => a.status === '预警').length,
        overdue: scheduleData.filter((a: any) => a.status === '超期').length,
        adjusted: scheduleData.filter((a: any) => a.status === '已调整').length,
      })
      setAlerts(scheduleData as any)
      setPlans(scheduleData as any)
    }
  }, [scheduleData])

  const loading = modelLoading || alertsLoading || plansLoading

  // Handle plan search
  const handlePlanSearch = () => {
    // 前端筛选
    const filtered = scheduleData.filter((item: any) =>
      item.orderNo?.includes(planSearchText) || item.productName?.includes(planSearchText)
    )
    setPlans(filtered as any)
  }

  // View alert detail
  const handleViewAlert = (alert: ScheduleAlert) => {
    setSelectedAlert(alert)
    setIsViewDialogOpen(true)
  }

  // View plan detail
  const handleViewPlan = (plan: SchedulePlan) => {
    setSelectedPlan(plan)
    setIsViewDialogOpen(true)
  }

  // Open reschedule dialog
  const handleOpenReschedule = (alert: ScheduleAlert) => {
    setSelectedAlert(alert)
    setRescheduleForm({
      plannedStart: '',
      plannedEnd: '',
      remark: '',
    })
    setIsRescheduleDialogOpen(true)
  }

  // Submit reschedule
  const handleReschedule = async () => {
    if (!selectedAlert?.orderNo) return
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

  // 所有列定义映射
  const allAlertColumnsMap: Record<string, ColumnDef<ScheduleAlert>> = {
    orderNo: {
      accessorKey: 'orderNo',
      header: '订单号',
      cell: ({ row }) => (
        <span className="font-medium text-cyan-300">{row.original.orderNo}</span>
      ),
    },
    productName: {
      accessorKey: 'productName',
      header: '客户订单号',
      cell: ({ row }) => row.original.productName,
    },
    quantity: {
      accessorKey: 'quantity',
      header: '计划数量',
      cell: ({ row }) => row.original.quantity,
    },
    deliveryDate: {
      accessorKey: 'deliveryDate',
      header: '计划交付日期',
      cell: ({ row }) => formatDateTime(row.original.deliveryDate),
    },
    remainingDays: {
      accessorKey: 'remainingDays',
      header: '剩余天数',
      cell: ({ row }) => {
        const days = row.original.remainingDays
        return (
          <span className={days < 3 ? 'text-red-400 font-bold' : ''}>
            {days > 0 ? `${days}天` : `${days}天`}
          </span>
        )
      },
    },
    completedRate: {
      accessorKey: 'completedRate',
      header: '完成率',
      cell: ({ row }) => {
        const rate = row.original.completedRate
        const color = rate >= 80 ? '#52c41a' : rate >= 50 ? '#faad14' : '#ff4d4f'
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${rate}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-xs text-slate-300 w-10 text-right">{rate}%</span>
          </div>
        )
      },
    },
    status: {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge
            className="px-2 py-1 rounded text-sm font-medium"
            style={{
              backgroundColor: `${getScheduleStatusColor(status)}20`,
              color: getScheduleStatusColor(status),
              borderColor: getScheduleStatusColor(status),
            }}
          >
            {status}
          </Badge>
        )
      },
    },
    alertLevel: {
      accessorKey: 'alertLevel',
      header: '预警级别',
      cell: ({ row }) => {
        const level = row.original.alertLevel
        return (
          <Badge
            className="px-2 py-1 rounded text-sm font-medium"
            style={{
              backgroundColor: `${getAlertLevelColor(level)}20`,
              color: getAlertLevelColor(level),
              borderColor: getAlertLevelColor(level),
            }}
          >
            {level}
          </Badge>
        )
      },
    },
    suggestedAction: {
      accessorKey: 'suggestedAction',
      header: '建议操作',
      cell: ({ row }) => (
        <span className="text-sm text-slate-300 max-w-[200px] truncate block" title={row.original.suggestedAction}>
          {row.original.suggestedAction}
        </span>
      ),
    },
    actions: {
      id: 'actions',
      size: 130,
      minSize: 130,
      maxSize: 130,
      meta: { isSticky: true } as any,
      header: '操作',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleViewAlert(row.original)}
            className="text-blue-300 hover:text-white hover:bg-blue-500/20"
          >
            查看
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleOpenReschedule(row.original)}
            className="text-cyan-300 hover:text-white hover:bg-cyan-500/20"
          >
            重排产
          </Button>
        </div>
      ),
    },
  }

  // 字段ID到列定义的映射
  const fieldToColumnMap: Record<string, keyof typeof allAlertColumnsMap> = {
    'serial-number': 'orderNo',
    'quantity': 'quantity',
    'delivery-date': 'deliveryDate',
    'completed-rate': 'completedRate',
    'select-status': 'status',
    'alert-level': 'alertLevel',
    'suggested-action': 'suggestedAction',
  }

  // 根据schema.form顺序动态生成alertColumns
  const alertColumns: ColumnDef<ScheduleAlert>[] = useMemo(() => {
    const columns: ColumnDef<ScheduleAlert>[] = []

    // 按fieldOrder添加列
    fieldOrder.forEach((fieldId: string) => {
      const columnKey = fieldToColumnMap[fieldId]
      if (columnKey && allAlertColumnsMap[columnKey]) {
        columns.push(allAlertColumnsMap[columnKey])
      }
    })

    // 添加默认列（如果schema中没有定义）
    const defaultOrder = ['orderNo', 'productName', 'quantity', 'deliveryDate', 'remainingDays', 'completedRate', 'status', 'alertLevel', 'suggestedAction']
    defaultOrder.forEach(key => {
      if (!columns.find(col => (col as any).accessorKey === key || (col as any).id === key)) {
        columns.push(allAlertColumnsMap[key])
      }
    })

    // 最后添加操作列
    columns.push(allAlertColumnsMap.actions)

    return columns
  }, [fieldOrder])

  // 排产计划表列定义映射
  const allPlanColumnsMap: Record<string, ColumnDef<SchedulePlan>> = {
    orderNo: {
      accessorKey: 'orderNo',
      header: '派工单号',
      cell: ({ row }) => (
        <span className="font-medium text-cyan-300">{row.original.orderNo || '-'}</span>
      ),
    },
    productName: {
      accessorKey: 'productName',
      header: '产品',
      cell: ({ row }) => row.original.productName || '-',
    },
    processName: {
      accessorKey: 'processName',
      header: '工序名称',
      cell: ({ row }) => row.original.processName || '-',
    },
    equipmentName: {
      accessorKey: 'equipmentName',
      header: '设备名称',
      cell: ({ row }) => row.original.equipmentName || '-',
    },
    plannedStart: {
      accessorKey: 'plannedStart',
      header: '计划开始时间',
      cell: ({ row }) => formatDateTime(row.original.plannedStart) || '-',
    },
    plannedEnd: {
      accessorKey: 'plannedEnd',
      header: '计划结束时间',
      cell: ({ row }) => formatDateTime(row.original.plannedEnd) || '-',
    },
    actualStart: {
      accessorKey: 'actualStart',
      header: '实际开始时间',
      cell: ({ row }) => (row.original.actualStart ? formatDateTime(row.original.actualStart) : '-'),
    },
    actualEnd: {
      accessorKey: 'actualEnd',
      header: '实际结束时间',
      cell: ({ row }) => (row.original.actualEnd ? formatDateTime(row.original.actualEnd) : '-'),
    },
    status: {
      accessorKey: 'status',
      header: '派工状态',
      cell: ({ row }) => {
        const status = row.original.status
        const colorMap: Record<string, string> = {
          '延误': '#ff4d4f',
          '进行中': '#1890ff',
          '已完成': '#52c41a',
          '未开始': '#999',
        }
        const color = colorMap[status] || '#999'
        return (
          <Badge
            className="px-2 py-1 rounded text-sm font-medium"
            style={{
              backgroundColor: `${color}20`,
              color,
              borderColor: color,
            }}
          >
            {status}
          </Badge>
        )
      },
    },
    actions: {
      id: 'actions',
      size: 130,
      minSize: 130,
      maxSize: 130,
      meta: { isSticky: true } as any,
      header: '操作',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleViewPlan(row.original)}
          className="text-blue-300 hover:text-white hover:bg-blue-500/20"
        >
          查看
        </Button>
      ),
    },
  }

  // 排产计划字段ID到列定义的映射
  const planFieldToColumnMap: Record<string, keyof typeof allPlanColumnsMap> = {
    'dispatch-no': 'orderNo',
    'product-name': 'productName',
    'process-name': 'processName',
    'equipment-name': 'equipmentName',
    'plan-start-time': 'plannedStart',
    'plan-end-time': 'plannedEnd',
    'actual-start-time': 'actualStart',
    'actual-end-time': 'actualEnd',
    'dispatch-status': 'status',
  }

  // 根据schema.form顺序动态生成planColumns
  const planColumns: ColumnDef<SchedulePlan>[] = useMemo(() => {
    const columns: ColumnDef<SchedulePlan>[] = []

    // 按fieldOrder添加列
    fieldOrder.forEach((fieldId: string) => {
      const columnKey = planFieldToColumnMap[fieldId]
      if (columnKey && allPlanColumnsMap[columnKey]) {
        columns.push(allPlanColumnsMap[columnKey])
      }
    })

    // 添加默认列（如果schema中没有定义）
    const defaultOrder = ['orderNo', 'productName', 'processName', 'equipmentName', 'plannedStart', 'plannedEnd', 'actualStart', 'actualEnd', 'status']
    defaultOrder.forEach(key => {
      if (!columns.find(col => (col as any).accessorKey === key || (col as any).id === key)) {
        columns.push(allPlanColumnsMap[key])
      }
    })

    // 最后添加操作列
    columns.push(allPlanColumnsMap.actions)

    return columns
  }, [fieldOrder])

  return (
    <div className="space-y-6">
      {/* ===== Stats Cards ===== */}
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

      {/* ===== Section A: Alert List ===== */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <div className="flex justify-between items-center gap-4 flex-wrap mb-4">
          <h3 className="text-lg font-semibold text-white">周期预警列表</h3>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap text-blue-200">预警级别</Label>
              <Select value={alertLevelFilter} onValueChange={setAlertLevelFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部级别</SelectItem>
                  {ALERT_LEVEL.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap text-blue-200">状态</Label>
              <Select value={alertStatusFilter} onValueChange={setAlertStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  {SCHEDULE_STATUS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-500/20 rounded-xl overflow-hidden">
          <DataTable
            columns={alertColumns}
            data={alerts}
            loading={loading}
            pagination={{
              ...alertsPagination,
              total: alerts.length,
              onPageChange: (page) => setAlertsPagination(prev => ({ ...prev, current: page })),
            }}
          />
        </div>
      </Card>

      {/* ===== Section B: Schedule Plan Table ===== */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <div className="flex justify-between items-center gap-4 flex-wrap mb-4">
          <h3 className="text-lg font-semibold text-white">排产计划表 (甘特图风格表格)</h3>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap text-blue-200">订单号</Label>
              <Input
                className="h-10 bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300 w-52"
                placeholder="搜索订单号或产品名称"
                value={planSearchText}
                onChange={(e) => setPlanSearchText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePlanSearch()}
              />
            </div>
            <Button onClick={handlePlanSearch} className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              搜索
            </Button>
          </div>
        </div>

        {/* Legend */}
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

        <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-500/20 rounded-xl overflow-hidden">
          <DataTable
            columns={planColumns}
            data={plans}
            loading={loading}
            pagination={{
              current: plansPagination.current,
              pageSize: plansPagination.pageSize,
              total: plans.length,
              onPageChange: (page) => setPlansPagination(prev => ({ ...prev, current: page })),
            }}
          />
        </div>
      </Card>

      {/* ===== View Dialog ===== */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] !flex !flex-col !p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-700 shrink-0">
            <DialogTitle className="text-slate-100">
              {selectedPlan ? '排产计划详情' : '预警详情'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedPlan ? '查看排产计划详细信息' : '查看订单预警详情'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar min-h-0">
            {selectedAlert && !selectedPlan && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">订单号</Label>
                  <p className="font-medium text-white">{selectedAlert.orderNo}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">产品名称</Label>
                  <p className="font-medium text-white">{selectedAlert.productName}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">计划数量</Label>
                  <p className="font-medium text-white">{selectedAlert.quantity}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">计划交付日期</Label>
                  <p className="font-medium text-white">{formatDateTime(selectedAlert.deliveryDate)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">剩余天数</Label>
                  <p className={`font-medium ${selectedAlert.remainingDays < 3 ? 'text-red-400' : 'text-white'}`}>
                    {selectedAlert.remainingDays}天
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">完成率</Label>
                  <p className="font-medium text-white">{selectedAlert.completedRate}%</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">状态</Label>
                  <Badge
                    className="px-2 py-1 rounded text-sm font-medium"
                    style={{
                      backgroundColor: `${getScheduleStatusColor(selectedAlert.status)}20`,
                      color: getScheduleStatusColor(selectedAlert.status),
                      borderColor: getScheduleStatusColor(selectedAlert.status),
                    }}
                  >
                    {selectedAlert.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">预警级别</Label>
                  <Badge
                    className="px-2 py-1 rounded text-sm font-medium"
                    style={{
                      backgroundColor: `${getAlertLevelColor(selectedAlert.alertLevel)}20`,
                      color: getAlertLevelColor(selectedAlert.alertLevel),
                      borderColor: getAlertLevelColor(selectedAlert.alertLevel),
                    }}
                  >
                    {selectedAlert.alertLevel}
                  </Badge>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-blue-200 text-sm">建议操作</Label>
                  <p className="font-medium text-white whitespace-pre-wrap">{selectedAlert.suggestedAction}</p>
                </div>
              </div>
            )}
            {selectedPlan && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">派工单号</Label>
                  <p className="font-medium text-cyan-300">{selectedPlan.orderNo || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">产品</Label>
                  <p className="font-medium text-white">{selectedPlan.productName || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">工序名称</Label>
                  <p className="font-medium text-white">{selectedPlan.processName || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">设备名称</Label>
                  <p className="font-medium text-white">{selectedPlan.equipmentName || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">计划开始时间</Label>
                  <p className="font-medium text-white">{formatDateTime(selectedPlan.plannedStart) || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">计划结束时间</Label>
                  <p className="font-medium text-white">{formatDateTime(selectedPlan.plannedEnd) || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">实际开始时间</Label>
                  <p className="font-medium text-white">{selectedPlan.actualStart ? formatDateTime(selectedPlan.actualStart) : '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">实际结束时间</Label>
                  <p className="font-medium text-white">{selectedPlan.actualEnd ? formatDateTime(selectedPlan.actualEnd) : '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200 text-sm">派工状态</Label>
                  <Badge
                    className="px-2 py-1 rounded text-sm font-medium"
                    style={{
                      backgroundColor: `${selectedPlan.status === '延误' ? '#ff4d4f' :
                          selectedPlan.status === '进行中' ? '#1890ff' :
                            selectedPlan.status === '已完成' ? '#52c41a' : '#999'
                        }20`,
                      color: selectedPlan.status === '延误' ? '#ff4d4f' :
                        selectedPlan.status === '进行中' ? '#1890ff' :
                          selectedPlan.status === '已完成' ? '#52c41a' : '#999',
                    }}
                  >
                    {selectedPlan.status}
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

      {/* ===== Reschedule Dialog ===== */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] !flex !flex-col !p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-700 shrink-0">
            <DialogTitle className="text-slate-100">重排产</DialogTitle>
            <DialogDescription className="text-slate-400">
              调整订单的排产计划
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar min-h-0">
            {/* Order Info */}
            {selectedAlert && (
              <div className="mb-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <h4 className="text-sm font-semibold text-blue-200 mb-3">订单信息</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-slate-400">订单号: </span>
                    <span className="text-cyan-300">{selectedAlert.orderNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">产品名称: </span>
                    <span className="text-white">{selectedAlert.productName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">计划交付日期: </span>
                    <span className="text-white">{formatDateTime(selectedAlert.deliveryDate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">完成率: </span>
                    <span className="text-white">{selectedAlert.completedRate}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400">当前状态: </span>
                    <Badge
                      className="px-2 py-1 rounded text-sm font-medium"
                      style={{
                        backgroundColor: `${getScheduleStatusColor(selectedAlert.status)}20`,
                        color: getScheduleStatusColor(selectedAlert.status),
                        borderColor: getScheduleStatusColor(selectedAlert.status),
                      }}
                    >
                      {selectedAlert.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-slate-400">剩余天数: </span>
                    <span className={selectedAlert.remainingDays < 3 ? 'text-red-400 font-bold' : 'text-white'}>
                      {selectedAlert.remainingDays}天
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Reschedule Form */}
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
    <div className="p-6 space-y-6">
      <div className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{
        borderColor: 'rgba(59, 130, 246, 0.3)'
      }}>
        <TableModel tableId={tableId} initQuery={false}>
          <PageContent />
        </TableModel>
      </div>
    </div>
  )
}
