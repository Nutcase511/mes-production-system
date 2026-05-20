import type { PageParams, PageResponse } from '@/types/api'
import type { ToolMaintenance, MaintenanceType, QualityCheckResult } from '@/types/tool-maintenance'

export const MAINTENANCE_TYPES: { value: MaintenanceType; label: string }[] = [
  { value: '重磨', label: '重磨' },
  { value: '涂层', label: '涂层' },
  { value: '刀柄保养', label: '刀柄保养' },
  { value: '报废', label: '报废' },
]

export const QUALITY_CHECK_RESULTS: { value: QualityCheckResult; label: string; color: string }[] = [
  { value: '合格', label: '合格', color: '#52c41a' },
  { value: '不合格', label: '不合格', color: '#ff4d4f' },
]

const mockData: ToolMaintenance[] = Array.from({ length: 20 }, (_, i) => {
  const types: MaintenanceType[] = ['重磨', '涂层', '刀柄保养', '报废']
  const maintainers = ['张师傅', '李技师', '王工程师']
  const tools = [
    { code: 'TL-F001', name: '硬质合金立铣刀' },
    { code: 'TL-T001', name: '外圆车刀' },
    { code: 'TL-D001', name: '麻花钻' },
    { code: 'TL-F003', name: '面铣刀' },
    { code: 'TL-R001', name: '铰刀' },
  ]
  const tool = tools[i % 5]
  const isFail = i % 6 === 5
  const dt = new Date(2026, 2, 27 - Math.floor(i/5), (i%28)+1)
  return {
    id: `tm-${i+1}`,
    maintenanceNo: `TM${String(Date.now()).slice(-10).slice(0,-i%4)}${String(i+1).padStart(4,'0')}`,
    toolId: `t-${(i%5)+1}`,
    toolCode: tool.code,
    toolName: tool.name,
    maintenanceType: types[i % 4],
    maintenanceDate: `${dt.toISOString().slice(0,10)} 10:00`,
    maintainer: maintainers[i%3],
    usageBefore: Math.floor(Math.random()*80)+20,
    usageAfter: types[i%4]==='报废'?0:Math.floor(Math.random()*40)+40,
    wearDegree: Math.floor(Math.random()*60)+20,
    cost: types[i%4]==='涂层'?Math.floor(Math.random()*500)+200:types[i%4]==='报废'?0:Math.floor(Math.random()*200)+50,
    qualityCheckResult: (isFail||types[i%4]==='报废')?'不合格':'合格',
    nextMaintenanceDate: types[i%4]==='报废'?'':new Date(dt.getTime()+30*86400000).toISOString().slice(0,10),
    remark: isFail?'重磨后精度仍不达标，建议报废':types[i%4]==='报废'?'已达使用寿命':'',
    _createTime: `${dt.toISOString().slice(0,10)} 10:00:00`,
    createUser: maintainers[i%3],
    _updateTime: `${dt.toISOString().slice(0,10)} 10:00:00`,
  }
})

export async function getToolMaintenanceList(params?: PageParams & { maintenanceType?: string; search?: string }): Promise<PageResponse<ToolMaintenance>> {
  const { page = 1, size = 15, maintenanceType, search } = params || {}
  await new Promise(r => setTimeout(r, 300))
  let filtered = [...mockData]
  if (maintenanceType && maintenanceType !== 'all') filtered = filtered.filter(i => i.maintenanceType === maintenanceType)
  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(i => i.maintenanceNo.toLowerCase().includes(s) || i.toolName.toLowerCase().includes(s) || i.toolCode.toLowerCase().includes(s))
  }
  const total = filtered.length
  const start = (page - 1) * size
  return { list: filtered.slice(start, start + size), total, page, size, totalPages: Math.ceil(total / size) }
}

export async function createToolMaintenance(data: Partial<ToolMaintenance>): Promise<ToolMaintenance> {
  await new Promise(r => setTimeout(r, 200))
  return { id: Date.now().toString(), ...data } as ToolMaintenance
}

export async function updateToolMaintenance(id: string, data: Partial<ToolMaintenance>): Promise<ToolMaintenance> {
  await new Promise(r => setTimeout(r, 200))
  return { id, ...data } as ToolMaintenance
}

export async function deleteToolMaintenance(_id: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 200))
  return true
}
