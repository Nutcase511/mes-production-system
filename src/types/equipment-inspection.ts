export type OverallStatus = '正常' | '异常'

export interface InspectionItem {
  itemNo: string
  itemName: string
  standard: string
  result: '正常' | '异常'
  inspected: boolean
  abnormalDesc: string
}

export interface EquipmentInspection {
  id: string
  inspectionNo: string
  equipmentId: string
  equipmentName: string
  inspectionDate: string
  inspector: string
  inspectionItems: InspectionItem[]
  overallStatus: OverallStatus
  abnormalDescription: string
  nextInspectionDate: string
  remark: string
  _createTime: string
  createUser: string
  _updateTime: string
}
