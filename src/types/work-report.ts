// 报工单相关类型定义

export type WorkReportStatus = '待检验' | '已检验' | '合格' | '不合格'

export interface WorkReport {
  id: string
  reportNo: string
  taskId: string
  taskNo: string
  assignmentId: string
  stepNo: string
  stepName: string
  equipmentId: string
  equipmentName: string
  operator: string
  reportDate: string
  qualifiedQuantity: number
  overproofQuantity: number
  scrapQuantity: number
  workTime: number
  status: WorkReportStatus
  isAuto: boolean
  abnormalInfo: string
  remark: string
  _createTime: string
  createUser: string
  _updateTime: string
}
