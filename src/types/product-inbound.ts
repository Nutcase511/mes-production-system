// 成品入库相关类型定义

export type QualityStatus = '合格' | '让步接收'
export type InboundStatus = '待入库' | '已入库'

export interface ProductInbound {
  id: string
  inboundNo: string
  taskId: string
  taskNo: string
  orderId: string
  batchNo: string
  warehouseId: string
  warehouseName: string
  location: string
  productCode: string
  productName: string
  inboundDate: string
  quantity: number
  inspector: string
  finalInspectionNo: string
  qualityStatus: QualityStatus
  status: InboundStatus
  keeper: string
  remark: string
  _createTime: string
  createUser: string
  _updateTime: string
}
