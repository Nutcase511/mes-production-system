// 终检单相关类型定义

export type FinalInspectionStatus = '待终检' | '合格' | '不合格' | '已返修' | '已报废'
export type QualityStatus = '合格' | '不合格' | '让步接收'

export interface FinalInspection {
  id: string
  inspectionNo: string
  workOrderId: string
  batchNo: string
  productCode: string
  productName: string
  specification: string
  quantity: number
  qualifiedQuantity: number
  unqualifiedQuantity: number
  scrapQuantity: number
  repairQuantity: number
  qualityStatus: QualityStatus
  inspectionStatus: FinalInspectionStatus
  inspectionDate: string
  inspector: string
  inspectionItems: InspectionItem[]
  defectDescription: string
  disposition: string // 处置意见：返修、报废、让步接收等
  remark: string
  _createTime: string
  createUser: string
  _updateTime: string
}

export interface InspectionItem {
  itemName: string
  standard: string
  measuredValue: string
  qualified: boolean
  tolerance?: string
}
