import type { PageParams, PageResponse } from '@/types/api'
import type { Material, MaterialType, MaterialStatus } from '@/types/material'

export const MATERIAL_TYPES: { value: MaterialType; label: string }[] = [
  { value: '原材料', label: '原材料' },
  { value: '刀具', label: '刀具' },
  { value: '量具', label: '量具' },
  { value: '辅料', label: '辅料' },
]

export const MATERIAL_STATUS: { value: MaterialStatus; label: string; color: string }[] = [
  { value: '启用', label: '启用', color: '#52c41a' },
  { value: '停用', label: '停用', color: '#999' },
]

const mockData: Material[] = [
  { id: '1', materialCode: 'MAT-001', materialName: '45#钢圆棒', materialType: '原材料', specification: 'Φ50×200mm', unit: '根', category: '碳素钢', technicalStandard: 'GB/T 699-2015', safetyStock: 100, leadTime: 7, status: '启用', remark: '', _createTime: '2025-01-01 08:00:00', createUser: 'admin', _updateTime: '2025-01-01 08:00:00' },
  { id: '2', materialCode: 'MAT-002', materialName: '不锈钢板304', materialType: '原材料', specification: '2.0×1220×2440mm', unit: '张', category: '不锈钢', technicalStandard: 'GB/T 3280-2015', safetyStock: 50, leadTime: 10, status: '启用', remark: '', _createTime: '2025-01-01 08:00:00', createUser: 'admin', _updateTime: '2025-01-01 08:00:00' },
  { id: '3', materialCode: 'MAT-003', materialName: '硬质合金铣刀', materialType: '刀具', specification: 'Φ10×75mm 4刃', unit: '把', category: '铣削刀具', technicalStandard: 'ISO 1641', safetyStock: 30, leadTime: 14, status: '启用', remark: '', _createTime: '2025-01-05 08:00:00', createUser: 'admin', _updateTime: '2025-01-05 08:00:00' },
  { id: '4', materialCode: 'MAT-004', materialName: '铝合金型材6061', materialType: '原材料', specification: '80×80×6000mm', unit: '根', category: '铝合金', technicalStandard: 'GB/T 6892-2015', safetyStock: 80, leadTime: 5, status: '启用', remark: '', _createTime: '2025-01-10 08:00:00', createUser: 'admin', _updateTime: '2025-01-10 08:00:00' },
  { id: '5', materialCode: 'MAT-005', materialName: '数显游标卡尺', materialType: '量具', specification: '0-150mm ±0.01mm', unit: '把', category: '长度量具', technicalStandard: 'GB/T 21389-2017', safetyStock: 10, leadTime: 21, status: '启用', remark: '', _createTime: '2025-01-15 08:00:00', createUser: 'admin', _updateTime: '2025-01-15 08:00:00' },
  { id: '6', materialCode: 'MAT-006', materialName: '切削液', materialType: '辅料', specification: '20L/桶', unit: '桶', category: '冷却润滑', technicalStandard: '', safetyStock: 20, leadTime: 3, status: '启用', remark: '水溶性切削液', _createTime: '2025-02-01 08:00:00', createUser: 'admin', _updateTime: '2025-02-01 08:00:00' },
  { id: '7', materialCode: 'MAT-007', materialName: '车刀片CNMG120408', materialType: '刀具', specification: 'CNMG120408-SM', unit: '片', category: '车削刀具', technicalStandard: 'ISO 1832', safetyStock: 100, leadTime: 7, status: '启用', remark: '', _createTime: '2025-02-10 08:00:00', createUser: 'admin', _updateTime: '2025-02-10 08:00:00' },
  { id: '8', materialCode: 'MAT-008', materialName: '铜棒H59', materialType: '原材料', specification: 'Φ30×300mm', unit: '根', category: '铜合金', technicalStandard: 'GB/T 4423-2007', safetyStock: 50, leadTime: 7, status: '启用', remark: '', _createTime: '2025-02-15 08:00:00', createUser: 'admin', _updateTime: '2025-02-15 08:00:00' },
  { id: '9', materialCode: 'MAT-009', materialName: '外径千分尺', materialType: '量具', specification: '25-50mm ±0.001mm', unit: '把', category: '长度量具', technicalStandard: 'GB/T 1216-2018', safetyStock: 8, leadTime: 21, status: '启用', remark: '', _createTime: '2025-03-01 08:00:00', createUser: 'admin', _updateTime: '2025-03-01 08:00:00' },
  { id: '10', materialCode: 'MAT-010', materialName: '防锈油', materialType: '辅料', specification: '18L/桶', unit: '桶', category: '防锈', technicalStandard: '', safetyStock: 15, leadTime: 3, status: '启用', remark: '', _createTime: '2025-03-10 08:00:00', createUser: 'admin', _updateTime: '2025-03-10 08:00:00' },
]

export async function getMaterialList(params?: PageParams & { materialType?: string; status?: string; search?: string }): Promise<PageResponse<Material>> {
  const { page = 1, size = 15, materialType, status, search } = params || {}
  await new Promise(r => setTimeout(r, 300))

  let filtered = [...mockData]
  if (materialType && materialType !== 'all') filtered = filtered.filter(i => i.materialType === materialType)
  if (status && status !== 'all') filtered = filtered.filter(i => i.status === status)
  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(i => i.materialCode.toLowerCase().includes(s) || i.materialName.toLowerCase().includes(s) || i.specification.toLowerCase().includes(s))
  }

  const total = filtered.length
  const start = (page - 1) * size
  return { list: filtered.slice(start, start + size), total, page, size, totalPages: Math.ceil(total / size) }
}

export async function createMaterial(data: Partial<Material>): Promise<Material> {
  await new Promise(r => setTimeout(r, 200))
  return { id: Date.now().toString(), ...data } as Material
}

export async function updateMaterial(id: string, data: Partial<Material>): Promise<Material> {
  await new Promise(r => setTimeout(r, 200))
  const item = mockData.find(i => i.id === id)
  return { ...item, ...data } as Material
}

export async function deleteMaterial(_id: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 200))
  return true
}
