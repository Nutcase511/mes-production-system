export type SupplierType = '刀具' | '原材料' | '外协加工'
export type CreditRating = 'A' | 'B' | 'C' | 'D'
export type SupplierStatus = '启用' | '停用'

export interface Supplier {
  id: string
  supplierCode: string
  supplierName: string
  supplierType: SupplierType
  contactPerson: string
  contactPhone: string
  contactEmail: string
  address: string
  creditRating: CreditRating
  status: SupplierStatus
  remark: string
  _createTime: string
  createUser: string
  _updateTime: string
}
