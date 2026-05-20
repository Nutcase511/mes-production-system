export type PurchaseType = '刀具' | '原材料' | '外部件'
export type PurchaseStatus = '待审批' | '已审批' | '已下单' | '部分到货' | '已到货'

export interface PurchaseItem {
  itemCode: string
  itemName: string
  specification: string
  quantity: number
  unit: string
  unitPrice: number
  amount: number
  technicalStandard: string
}

export interface PurchaseOrder {
  id: string
  purchaseNo: string
  purchaseType: PurchaseType
  relatedTaskId: string
  supplierId: string
  supplierName: string
  requestDate: string
  requiredDate: string
  purchaseItems: PurchaseItem[]
  totalAmount: number
  status: PurchaseStatus
  approvalStatus: string
  approver: string
  approvalDate: string
  remark: string
  _createTime: string
  createUser: string
  _updateTime: string
}
