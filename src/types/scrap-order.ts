// 报废单相关类型定义

export type ScrapType = '生产报废' | '检验报废' | '外协报废'
export type ScrapDefectLevel = 'Class I' | 'Class II' | 'Class III'
export type ApprovalStatus = '待审批' | '已批准' | '已拒绝'
export type ScrapStatus = '待报废' | '已报废'

export interface ScrapOrder {
  id: string
  scrapNo: string
  taskId: string
  batchNo: string
  scrapType: ScrapType
  scrapReason: string
  defectLevel: ScrapDefectLevel
  productCode: string
  productName: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  residualValue: number
  responsiblePerson: string
  approvalStatus: ApprovalStatus
  approver: string
  approvalDate: string
  status: ScrapStatus
  remark: string
  _createTime: string
  createUser: string
  _updateTime: string
}
