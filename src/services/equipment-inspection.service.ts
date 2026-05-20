import type { PageParams, PageResponse } from '@/types/api'
import type { EquipmentInspection, OverallStatus } from '@/types/equipment-inspection'

export const OVERALL_STATUS: { value: OverallStatus; label: string; color: string }[] = [
  { value: '正常', label: '正常', color: '#52c41a' },
  { value: '异常', label: '异常', color: '#ff4d4f' },
]

const defaultItems = [
  { itemNo: '1', itemName: '主轴运转', standard: '无异响、温度正常', result: '正常' as const, inspected: true, abnormalDesc: '' },
  { itemNo: '2', itemName: '润滑系统', standard: '油路畅通、油量充足', result: '正常' as const, inspected: true, abnormalDesc: '' },
  { itemNo: '3', itemName: '冷却系统', standard: '冷却液充足、管路无泄漏', result: '正常' as const, inspected: true, abnormalDesc: '' },
  { itemNo: '4', itemName: '安全装置', standard: '防护罩完好、急停按钮正常', result: '正常' as const, inspected: true, abnormalDesc: '' },
  { itemNo: '5', itemName: '精度检测', standard: '加工精度在允许范围内', result: '正常' as const, inspected: true, abnormalDesc: '' },
]

const mockData: EquipmentInspection[] = Array.from({ length: 25 }, (_, i) => {
  const isAbnormal = i % 5 === 4
  const items = defaultItems.map(it => ({
    ...it,
    result: (isAbnormal && parseInt(it.itemNo) <= 2 ? '异常' as const : '正常' as const),
    inspected: true,
    abnormalDesc: (isAbnormal && parseInt(it.itemNo) === 1) ? '主轴温度偏高，达到65°C' : '',
  }))
  const inspectors = ['张伟', '李明', '王强', '赵磊']
  const equipmentNames = ['CNC车床-001', '数控铣床-003', '外圆磨床-002', '加工中心-001', 'CNC车床-002', '钻床-001']
  const dt = new Date(2026, 2, 27 - Math.floor(i/4))
  return {
    id: `ei-${i+1}`,
    inspectionNo: `EI${String(Date.now()).slice(-10).slice(0,-i%4)}${String(i+1).padStart(4,'0')}`,
    equipmentId: `eq-${(i%6)+1}`,
    equipmentName: equipmentNames[i%6],
    inspectionDate: `${dt.toISOString().slice(0,10)} ${8+Math.floor(Math.random()*8)}:00`,
    inspector: inspectors[i%4],
    inspectionItems: items,
    overallStatus: isAbnormal ? '异常' : '正常',
    abnormalDescription: isAbnormal ? '主轴温度偏高，建议停机检查' : '',
    nextInspectionDate: new Date(dt.getTime() + 7*86400000).toISOString().slice(0,10),
    remark: '',
    _createTime: `${dt.toISOString().slice(0,10)} 10:00:00`,
    createUser: inspectors[i%4],
    _updateTime: `${dt.toISOString().slice(0,10)} 10:00:00`,
  }
})

export async function getEquipmentInspectionList(params?: PageParams & { overallStatus?: string; search?: string }): Promise<PageResponse<EquipmentInspection>> {
  const { page = 1, size = 15, overallStatus, search } = params || {}
  await new Promise(r => setTimeout(r, 300))
  let filtered = [...mockData]
  if (overallStatus && overallStatus !== 'all') filtered = filtered.filter(i => i.overallStatus === overallStatus)
  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(i => i.inspectionNo.toLowerCase().includes(s) || i.equipmentName.toLowerCase().includes(s))
  }
  const total = filtered.length
  const start = (page - 1) * size
  return { list: filtered.slice(start, start + size), total, page, size, totalPages: Math.ceil(total / size) }
}

export async function createEquipmentInspection(data: Partial<EquipmentInspection>): Promise<EquipmentInspection> {
  await new Promise(r => setTimeout(r, 200))
  return { id: Date.now().toString(), ...data } as EquipmentInspection
}

export async function updateEquipmentInspection(id: string, data: Partial<EquipmentInspection>): Promise<EquipmentInspection> {
  await new Promise(r => setTimeout(r, 200))
  return { id, ...data } as EquipmentInspection
}

export async function deleteEquipmentInspection(_id: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 200))
  return true
}
