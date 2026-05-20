import type { PageParams, PageResponse } from '@/types/api'
import type { Tool, ToolType, LifeUnit, ToolStatus } from '@/types/tool'

export const TOOL_TYPES: { value: ToolType; label: string }[] = [
  { value: '铣刀', label: '铣刀' },
  { value: '车刀', label: '车刀' },
  { value: '钻头', label: '钻头' },
  { value: '铰刀', label: '铰刀' },
  { value: '镗刀', label: '镗刀' },
  { value: '丝锥', label: '丝锥' },
  { value: '其他', label: '其他' },
]

export const LIFE_UNITS: { value: LifeUnit; label: string }[] = [
  { value: '小时', label: '小时' },
  { value: '次数', label: '次数' },
]

export const TOOL_STATUS: { value: ToolStatus; label: string; color: string }[] = [
  { value: '在库', label: '在库', color: '#52c41a' },
  { value: '使用中', label: '使用中', color: '#1890ff' },
  { value: '维修中', label: '维修中', color: '#faad14' },
  { value: '已报废', label: '已报废', color: '#ff4d4f' },
]

const mockData: Tool[] = [
  { id: '1', toolCode: 'TL-F001', toolName: '硬质合金立铣刀', toolType: '铣刀', specification: 'Φ10×75mm 4刃', coating: 'TiAlN', manufacturer: '华东精密工具', applicableEquipment: ['CNC铣床-001', 'CNC铣床-002', '加工中心-001'], standardLife: 120, currentLife: 45, lifeUnit: '小时', status: '使用中', warehouseId: 'w1', location: 'A-01-05', remark: '', _createTime: '2025-01-15 10:00:00', createUser: 'admin', _updateTime: '2025-03-20 10:00:00' },
  { id: '2', toolCode: 'TL-F002', toolName: '球头铣刀', toolType: '铣刀', specification: 'Φ6×50mm 2刃', coating: 'TiCN', manufacturer: '深圳硬质合金厂', applicableEquipment: ['CNC铣床-001', '加工中心-001'], standardLife: 80, currentLife: 80, lifeUnit: '小时', status: '已报废', warehouseId: '', location: '', remark: '已达使用寿命', _createTime: '2025-01-15 10:00:00', createUser: 'admin', _updateTime: '2025-03-15 10:00:00' },
  { id: '3', toolCode: 'TL-T001', toolName: '外圆车刀', toolType: '车刀', specification: 'CNMG120408', coating: 'CVD', manufacturer: '山特维克', applicableEquipment: ['CNC车床-001', 'CNC车床-002'], standardLife: 60, currentLife: 20, lifeUnit: '次数', status: '使用中', warehouseId: 'w1', location: '', remark: '', _createTime: '2025-02-01 10:00:00', createUser: 'admin', _updateTime: '2025-03-25 10:00:00' },
  { id: '4', toolCode: 'TL-T002', toolName: '螺纹车刀', toolType: '车刀', specification: '16ER 1.5ISO', coating: 'TiN', manufacturer: '肯纳金属', applicableEquipment: ['CNC车床-001'], standardLife: 200, currentLife: 0, lifeUnit: '次数', status: '在库', warehouseId: 'w1', location: 'A-02-03', remark: '', _createTime: '2025-02-05 10:00:00', createUser: 'admin', _updateTime: '2025-02-05 10:00:00' },
  { id: '5', toolCode: 'TL-D001', toolName: '麻花钻', toolType: '钻头', specification: 'Φ8×120mm', coating: 'TiN', manufacturer: '华东精密工具', applicableEquipment: ['CNC铣床-001', '钻床-001'], standardLife: 500, currentLife: 320, lifeUnit: '次数', status: '使用中', warehouseId: 'w1', location: '', remark: '', _createTime: '2025-02-10 10:00:00', createUser: 'admin', _updateTime: '2025-03-20 10:00:00' },
  { id: '6', toolCode: 'TL-D002', toolName: '中心钻', toolType: '钻头', specification: 'Φ3×60mm', coating: '', manufacturer: '国产', applicableEquipment: ['CNC车床-001', 'CNC车床-002'], standardLife: 1000, currentLife: 680, lifeUnit: '次数', status: '使用中', warehouseId: 'w1', location: '', remark: '', _createTime: '2025-02-15 10:00:00', createUser: 'admin', _updateTime: '2025-03-22 10:00:00' },
  { id: '7', toolCode: 'TL-R001', toolName: '铰刀', toolType: '铰刀', specification: 'Φ10×150mm H7', coating: 'TiN', manufacturer: '株洲钻石', applicableEquipment: ['CNC铣床-002'], standardLife: 300, currentLife: 150, lifeUnit: '次数', status: '使用中', warehouseId: 'w1', location: '', remark: '', _createTime: '2025-03-01 10:00:00', createUser: 'admin', _updateTime: '2025-03-20 10:00:00' },
  { id: '8', toolCode: 'TL-B001', toolName: '镗刀', toolType: '镗刀', specification: 'Φ20-Φ50mm 微调', coating: '', manufacturer: '山特维克', applicableEquipment: ['加工中心-001', 'CNC铣床-001'], standardLife: 200, currentLife: 200, lifeUnit: '小时', status: '维修中', warehouseId: '', location: '', remark: '精度下降，送修中', _createTime: '2025-03-05 10:00:00', createUser: 'admin', _updateTime: '2025-03-26 10:00:00' },
  { id: '9', toolCode: 'TL-S001', toolName: '丝锥', toolType: '丝锥', specification: 'M10×1.5 HSS-E', coating: 'TiN', manufacturer: 'OSG', applicableEquipment: ['CNC铣床-001', 'CNC铣床-002'], standardLife: 800, currentLife: 0, lifeUnit: '次数', status: '在库', warehouseId: 'w1', location: 'A-03-01', remark: '', _createTime: '2025-03-10 10:00:00', createUser: 'admin', _updateTime: '2025-03-10 10:00:00' },
  { id: '10', toolCode: 'TL-F003', toolName: '面铣刀', toolType: '铣刀', specification: 'Φ63×50mm 5刃', coating: 'PVD', manufacturer: '瓦尔特', applicableEquipment: ['加工中心-001', 'CNC铣床-002'], standardLife: 150, currentLife: 75, lifeUnit: '小时', status: '使用中', warehouseId: 'w1', location: '', remark: '', _createTime: '2025-03-12 10:00:00', createUser: 'admin', _updateTime: '2025-03-25 10:00:00' },
]

export async function getToolList(params?: PageParams & { toolType?: string; status?: string; search?: string }): Promise<PageResponse<Tool>> {
  const { page = 1, size = 15, toolType, status, search } = params || {}
  await new Promise(r => setTimeout(r, 300))

  let filtered = [...mockData]
  if (toolType && toolType !== 'all') filtered = filtered.filter(i => i.toolType === toolType)
  if (status && status !== 'all') filtered = filtered.filter(i => i.status === status)
  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(i => i.toolCode.toLowerCase().includes(s) || i.toolName.toLowerCase().includes(s))
  }

  const total = filtered.length
  const start = (page - 1) * size
  return { list: filtered.slice(start, start + size), total, page, size, totalPages: Math.ceil(total / size) }
}

export async function createTool(data: Partial<Tool>): Promise<Tool> {
  await new Promise(r => setTimeout(r, 200))
  return { id: Date.now().toString(), ...data } as Tool
}

export async function updateTool(id: string, data: Partial<Tool>): Promise<Tool> {
  await new Promise(r => setTimeout(r, 200))
  const item = mockData.find(i => i.id === id)
  return { ...item, ...data } as Tool
}

export async function deleteTool(_id: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 200))
  return true
}
