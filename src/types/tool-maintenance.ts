export type MaintenanceType = '重磨' | '涂层' | '刀柄保养' | '报废'
export type QualityCheckResult = '合格' | '不合格'

export interface ToolMaintenance {
  id: string
  maintenanceNo: string
  toolId: string
  toolCode: string
  toolName: string
  maintenanceType: MaintenanceType
  maintenanceDate: string
  maintainer: string
  usageBefore: number
  usageAfter: number
  wearDegree: number
  cost: number
  qualityCheckResult: QualityCheckResult
  nextMaintenanceDate: string
  remark: string
  _createTime: string
  createUser: string
  _updateTime: string
}
