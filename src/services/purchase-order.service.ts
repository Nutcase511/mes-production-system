import type { PageParams, PageResponse } from '@/types/api'
import type { PurchaseOrder, PurchaseType, PurchaseStatus } from '@/types/purchase-order'

export const PURCHASE_TYPES: { value: PurchaseType; label: string }[] = [
  { value: '刀具', label: '刀具' },
  { value: '原材料', label: '原材料' },
  { value: '外部件', label: '外部件' },
]

export const PURCHASE_STATUS: { value: PurchaseStatus; label: string; color: string }[] = [
  { value: '待审批', label: '待审批', color: '#faad14' },
  { value: '已审批', label: '已审批', color: '#1890ff' },
  { value: '已下单', label: '已下单', color: '#722ed1' },
  { value: '部分到货', label: '部分到货', color: '#fa8c16' },
  { value: '已到货', label: '已到货', color: '#52c41a' },
]

const mockData: PurchaseOrder[] = Array.from({ length: 25 }, (_, i) => {
  const types: PurchaseType[] = ['刀具', '原材料', '外部件']
  const statuses: PurchaseStatus[] = ['待审批', '已审批', '已下单', '部分到货', '已到货']
  const suppliers = ['华东精密工具有限公司', '宝钢材料供应公司', '苏州精密外协加工厂', '深圳硬质合金刀具厂', '无锡不锈钢材料公司']
  const items = [
    { itemCode: `ITM-${String(i+1).padStart(3,'0')}-01`, itemName: i%3===0?'硬质合金铣刀':i%3===1?'45#钢圆棒':'密封轴承', specification: i%3===0?'Φ10×75mm':'Φ50×200mm', quantity: Math.floor(Math.random()*100)+10, unit: i%3===0?'把':'根', unitPrice: Math.floor(Math.random()*500)+50, amount: 0, technicalStandard: 'GB/T 699' },
    { itemCode: `ITM-${String(i+1).padStart(3,'0')}-02`, itemName: i%3===0?'车刀片CNMG120408':i%3===1?'不锈钢板304':'铜管接头', specification: 'CNMG120408', quantity: Math.floor(Math.random()*200)+20, unit: i%3===0?'片':'张', unitPrice: Math.floor(Math.random()*100)+20, amount: 0, technicalStandard: 'ISO 1832' },
  ]
  items.forEach(it => { it.amount = it.quantity * it.unitPrice })
  const totalAmount = items.reduce((sum, it) => sum + it.amount, 0)
  const date = new Date(2026, 2 - Math.floor(i/5), (i % 28) + 1)
  return {
    id: `po-${i+1}`,
    purchaseNo: `PU${String(Date.now()).slice(-10).slice(0,-i%4)}${String(i+1).padStart(4,'0')}`,
    purchaseType: types[i % 3],
    relatedTaskId: '',
    supplierId: `sup-${(i%5)+1}`,
    supplierName: suppliers[i % 5],
    requestDate: date.toISOString().slice(0,10),
    requiredDate: new Date(date.getTime() + 14*86400000).toISOString().slice(0,10),
    purchaseItems: items,
    totalAmount,
    status: statuses[i % 5],
    approvalStatus: i%5===0?'待审批':'已批准',
    approver: i%5===0?'':'管理员',
    approvalDate: i%5===0?'':date.toISOString().slice(0,10),
    remark: '',
    _createTime: `${date.toISOString().slice(0,10)} 10:00:00`,
    createUser: 'admin',
    _updateTime: `${date.toISOString().slice(0,10)} 10:00:00`,
  }
})

export async function getPurchaseOrderList(params?: PageParams & { purchaseType?: string; status?: string; search?: string }): Promise<PageResponse<PurchaseOrder>> {
  const { page = 1, size = 15, purchaseType, status, search } = params || {}
  await new Promise(r => setTimeout(r, 300))
  let filtered = [...mockData]
  if (purchaseType && purchaseType !== 'all') filtered = filtered.filter(i => i.purchaseType === purchaseType)
  if (status && status !== 'all') filtered = filtered.filter(i => i.status === status)
  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(i => i.purchaseNo.toLowerCase().includes(s) || i.supplierName.toLowerCase().includes(s))
  }
  const total = filtered.length
  const start = (page - 1) * size
  return { list: filtered.slice(start, start + size), total, page, size, totalPages: Math.ceil(total / size) }
}

export async function createPurchaseOrder(data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
  await new Promise(r => setTimeout(r, 200))
  return { id: Date.now().toString(), ...data } as PurchaseOrder
}

export async function updatePurchaseOrder(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
  await new Promise(r => setTimeout(r, 200))
  return { id, ...data } as PurchaseOrder
}

export async function deletePurchaseOrder(_id: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 200))
  return true
}

export async function approvePurchaseOrder(_id: string, _approved: boolean): Promise<boolean> {
  await new Promise(r => setTimeout(r, 200))
  return true
}
