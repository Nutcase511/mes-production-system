import type { PageParams, PageResponse } from '@/types/api'
import type { InventoryDetail, WarehouseType, InventoryDetailStatus } from '@/types/inventory-detail'

export const WAREHOUSE_TYPES: { value: WarehouseType; label: string }[] = [
  { value: '一级库', label: '一级库' },
  { value: '二级库', label: '二级库' },
  { value: '成品库', label: '成品库' },
  { value: '半成品库', label: '半成品库' },
]

export const INVENTORY_DETAIL_STATUS: { value: InventoryDetailStatus; label: string; color: string }[] = [
  { value: '在库', label: '在库', color: '#52c41a' },
  { value: '预留', label: '预留', color: '#1890ff' },
  { value: '待检', label: '待检', color: '#faad14' },
]

const mockData: InventoryDetail[] = Array.from({ length: 30 }, (_, i) => {
  const whTypes: WarehouseType[] = ['一级库', '二级库', '成品库', '半成品库']
  const whNames: Record<string, string> = { '一级库': '中心仓库', '二级库': '机加工车间仓', '成品库': '成品库A', '半成品库': '半成品暂存区' }
  const statuses: InventoryDetailStatus[] = ['在库', '预留', '待检']
  const wt = whTypes[i % 4]
  return {
    id: `id-${i+1}`,
    warehouseId: `wh-${(i%4)+1}`,
    warehouseName: whNames[wt],
    warehouseType: wt,
    location: `${String.fromCharCode(65+i%4)}-${String(Math.floor(i/4)+1).padStart(2,'0')}-${String((i%8)+1).padStart(2,'0')}`,
    materialId: `mat-${(i%10)+1}`,
    materialCode: `MAT-${String((i%10)+1).padStart(3,'0')}`,
    materialName: ['45#钢圆棒','不锈钢板304','硬质合金铣刀','铝合金型材6061','数显游标卡尺','切削液','车刀片CNMG','铜棒H59','外径千分尺','防锈油'][i%10],
    batchNo: `B${20260300+i}`,
    furnaceNo: i%3===0?`F${20260300+i}`:'',
    quantity: Math.floor(Math.random()*500)+10,
    unit: ['根','张','把','把','桶','片','根','把','桶'][i%9]||'件',
    unitCost: Math.floor(Math.random()*1000)+10,
    status: statuses[i%3],
    supplierId: `sup-${(i%5)+1}`,
    supplierName: ['华东精密工具','宝钢材料','苏州外协','深圳硬质合金','无锡不锈钢'][i%5],
    inboundDate: new Date(2026, 2, (i%28)+1).toISOString().slice(0,10),
    expiryDate: i%4===0?new Date(2027, 2, (i%28)+1).toISOString().slice(0,10):'',
    _createTime: `2026-03-${String((i%28)+1).padStart(2,'0')} 10:00:00`,
    createUser: 'admin',
  }
})

export async function getInventoryDetailList(params?: PageParams & { warehouseType?: string; status?: string; search?: string }): Promise<PageResponse<InventoryDetail>> {
  const { page = 1, size = 15, warehouseType, status, search } = params || {}
  await new Promise(r => setTimeout(r, 300))
  let filtered = [...mockData]
  if (warehouseType && warehouseType !== 'all') filtered = filtered.filter(i => i.warehouseType === warehouseType)
  if (status && status !== 'all') filtered = filtered.filter(i => i.status === status)
  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(i => i.materialCode.toLowerCase().includes(s) || i.materialName.toLowerCase().includes(s) || i.location.toLowerCase().includes(s))
  }
  const total = filtered.length
  const start = (page - 1) * size
  return { list: filtered.slice(start, start + size), total, page, size, totalPages: Math.ceil(total / size) }
}

export async function createInventoryDetail(data: Partial<InventoryDetail>): Promise<InventoryDetail> {
  await new Promise(r => setTimeout(r, 200))
  return { id: Date.now().toString(), ...data } as InventoryDetail
}

export async function updateInventoryDetail(id: string, data: Partial<InventoryDetail>): Promise<InventoryDetail> {
  await new Promise(r => setTimeout(r, 200))
  return { id, ...data } as InventoryDetail
}

export async function deleteInventoryDetail(_id: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 200))
  return true
}
