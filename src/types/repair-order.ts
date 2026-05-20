// 返修单相关类型定义

export type RepairType = '首检不合格返修' | '终检不合格返修' | '外协返修'
export type RepairDefectLevel = '轻微' | '严重'
export type RepairStatus = '待返修' | '返修中' | '已返修' | '报废'

export interface RepairOrder {
  id: string
  repairNo: string
  originalTaskId: string
  originalBatchNo: string
  newBatchNo: string
  repairType: RepairType
  repairReason: string
  defectLevel: RepairDefectLevel
  quantity: number
  repairRouteId: string
  status: RepairStatus
  startDate: string
  endDate: string
  actualCost: number
  remark: string
  _createTime: string
  createUser: string
  _updateTime: string
}
