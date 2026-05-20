export type ScheduleStatus = '正常' | '预警' | '超期' | '已调整'
export type AlertLevel = '低' | '中' | '高'

export interface ScheduleAlert {
  id: string
  orderNo: string
  productName: string
  quantity: number
  deliveryDate: string
  remainingDays: number
  completedRate: number
  status: ScheduleStatus
  alertLevel: AlertLevel
  suggestedAction: string
  _createTime: string
}

export interface SchedulePlan {
  id: string
  orderNo: string
  productName: string
  processName: string
  equipmentName: string
  plannedStart: string
  plannedEnd: string
  actualStart: string
  actualEnd: string
  status: '未开始' | '进行中' | '已完成' | '延误'
  _createTime: string
}
