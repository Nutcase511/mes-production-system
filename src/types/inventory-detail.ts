export type WarehouseType = '一级库' | '二级库' | '成品库' | '半成品库'
export type InventoryDetailStatus = '在库' | '预留' | '待检'

export interface InventoryDetail {
  id: string
  warehouseId: string
  warehouseName: string
  warehouseType: WarehouseType
  location: string
  materialId: string
  materialCode: string
  materialName: string
  batchNo: string
  furnaceNo: string
  quantity: number
  unit: string
  unitCost: number
  status: InventoryDetailStatus
  supplierId: string
  supplierName: string
  inboundDate: string
  expiryDate: string
  // 台账合并字段
  openingBalance: number // 期初
  monthlyInbound: number // 本月入库
  monthlyOutbound: number // 本月出库
  agingDays: number // 库龄(天)
  _createTime: string
  createUser: string
}
