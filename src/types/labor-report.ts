export type ReportType = '日报' | '周报' | '月报'

export interface WorkRecord {
  taskNo: string
  stepNo: string
  stepName: string
  standardTime: number
  actualTime: number
  quantity: number
  qualified: number
}

export interface LaborReport {
  id: string
  reportNo: string
  reportDate: string
  reportType: ReportType
  operator: string
  teamId: string
  teamName: string
  totalStandardTime: number
  totalActualTime: number
  efficiency: number
  workRecords: WorkRecord[]
  _createTime: string
  createUser: string
  _updateTime: string
}
