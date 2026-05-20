import type { PageParams, PageResponse } from '@/types/api'
import type { InventoryTransaction, TransactionType, RelatedOrderType } from '@/types/inventory-transaction'

export const TRANSACTION_TYPES: { value: TransactionType; label: string; color: string }[] = [
  { value: '入库', label: '入库', color: '#52c41a' },
  { value: '出库', label: '出库', color: '#ff4d4f' },
  { value: '调拨', label: '调拨', color: '#1890ff' },
  { value: '盘点', label: '盘点', color: '#722ed1' },
  { value: '报废', label: '报废', color: '#999' },
]

export const RELATED_ORDER_TYPES: { value: RelatedOrderType; label: string }[] = [
  { value: '采购单', label: '采购单' },
  { value: '领料单', label: '领料单' },
  { value: '成品入库', label: '成品入库' },
  { value: '报废单', label: '报废单' },
  { value: '调拨单', label: '调拨单' },
  { value: '', label: '无' },
]

const mockData: InventoryTransaction[] = Array.from({ length: 30 }, (_, i) => {
  const types: TransactionType[] = ['入库', '出库', '调拨', '盘点', '报废']
  const orderTypes: RelatedOrderType[] = ['采购单', '领料单', '成品入库', '报废单', '调拨单', '']
  const operators = ['张伟', '李明', '王强', '赵磊', '陈刚', '孙丽']
  const warehouses = ['中心仓库', '机加工车间仓', '成品库A', '半成品暂存区']
  const materials = ['45#钢圆棒', '不锈钢板304', '硬质合金铣刀', '铝合金型材6061', '切削液', '车刀片CNMG', '铜棒H59']
  const dt = new Date(2026, 2, 27 - Math.floor(i/5), (i%24)+1, Math.floor(Math.random()*8)+8)
  return {
    id: `tx-${i+1}`,
    transactionNo: `TX${String(Date.now()).slice(-10).slice(0,-i%4)}${String(i+1).padStart(4,'0')}`,
    transactionType: types[i % 5],
    transactionDate: dt.toISOString().slice(0,16).replace('T',' '),
    warehouseId: `wh-${(i%4)+1}`,
    warehouseName: warehouses[i%4],
    materialId: `mat-${(i%7)+1}`,
    materialCode: `MAT-${String((i%7)+1).padStart(3,'0')}`,
    materialName: materials[i%7],
    batchNo: `B${20260300+i}`,
    quantity: types[i%5]==='出库'||types[i%5]==='报废'?-(Math.floor(Math.random()*50)+1):Math.floor(Math.random()*100)+10,
    unit: ['根','张','把','桶','片'][i%5],
    unitCost: Math.floor(Math.random()*500)+10,
    totalCost: 0,
    relatedOrderId: `${types[i%5]==='入库'?'PU':types[i%5]==='出库'?'MR':'TF'}${String(i+1).padStart(4,'0')}`,
    relatedOrderType: orderTypes[i%6],
    operator: operators[i%6],
    remark: '',
    _createTime: dt.toISOString().slice(0,19).replace('T',' '),
    createUser: operators[i%6],
  }
})
mockData.forEach(tx => { tx.totalCost = Math.abs(tx.quantity) * tx.unitCost })

export async function getInventoryTransactionList(params?: PageParams & { transactionType?: string; search?: string }): Promise<PageResponse<InventoryTransaction>> {
  const { page = 1, size = 15, transactionType, search } = params || {}
  await new Promise(r => setTimeout(r, 300))
  let filtered = [...mockData]
  if (transactionType && transactionType !== 'all') filtered = filtered.filter(i => i.transactionType === transactionType)
  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(i => i.transactionNo.toLowerCase().includes(s) || i.materialName.toLowerCase().includes(s) || i.materialCode.toLowerCase().includes(s))
  }
  const total = filtered.length
  const start = (page - 1) * size
  return { list: filtered.slice(start, start + size), total, page, size, totalPages: Math.ceil(total / size) }
}

export async function createInventoryTransaction(data: Partial<InventoryTransaction>): Promise<InventoryTransaction> {
  await new Promise(r => setTimeout(r, 200))
  return { id: Date.now().toString(), ...data } as InventoryTransaction
}
