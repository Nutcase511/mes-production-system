export type TransactionType = '入库' | '出库' | '调拨' | '盘点' | '报废'
export type RelatedOrderType = '采购单' | '领料单' | '成品入库' | '报废单' | '调拨单' | ''

export interface InventoryTransaction {
  id: string
  transactionNo: string
  transactionType: TransactionType
  transactionDate: string
  warehouseId: string
  warehouseName: string
  materialId: string
  materialCode: string
  materialName: string
  batchNo: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  relatedOrderId: string
  relatedOrderType: RelatedOrderType
  operator: string
  remark: string
  _createTime: string
  createUser: string
}
