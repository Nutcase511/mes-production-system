export type StandardStatus = '启用' | '停用'

export interface LaborStandard {
  id: string
  productCode: string
  stepNo: string
  stepName: string
  equipmentType: string
  standardTime: number
  preparationTime: number
  batchSize: number
  difficultyCoefficient: number
  batchCoefficient: number
  version: string
  effectiveDate: string
  status: StandardStatus
  remark: string
  _createTime: string
  createUser: string
  _updateTime: string
}
