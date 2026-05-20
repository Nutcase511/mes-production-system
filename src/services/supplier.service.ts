import type { PageParams, PageResponse } from '@/types/api'
import type { Supplier, SupplierType, CreditRating, SupplierStatus } from '@/types/supplier'

export const SUPPLIER_TYPES: { value: SupplierType; label: string }[] = [
  { value: '刀具', label: '刀具' },
  { value: '原材料', label: '原材料' },
  { value: '外协加工', label: '外协加工' },
]

export const CREDIT_RATINGS: { value: CreditRating; label: string; color: string }[] = [
  { value: 'A', label: 'A级', color: '#52c41a' },
  { value: 'B', label: 'B级', color: '#1890ff' },
  { value: 'C', label: 'C级', color: '#faad14' },
  { value: 'D', label: 'D级', color: '#ff4d4f' },
]

export const SUPPLIER_STATUS: { value: SupplierStatus; label: string; color: string }[] = [
  { value: '启用', label: '启用', color: '#52c41a' },
  { value: '停用', label: '停用', color: '#999' },
]

const mockData: Supplier[] = [
  { id: '1', supplierCode: 'SUP-001', supplierName: '华东精密工具有限公司', supplierType: '刀具', contactPerson: '张经理', contactPhone: '13812345678', contactEmail: 'zhang@hd-tools.com', address: '上海市松江区工业区', creditRating: 'A', status: '启用', remark: '长期合作供应商', _createTime: '2025-01-10 10:00:00', createUser: 'admin', _updateTime: '2025-01-10 10:00:00' },
  { id: '2', supplierCode: 'SUP-002', supplierName: '宝钢材料供应公司', supplierType: '原材料', contactPerson: '李总', contactPhone: '13987654321', contactEmail: 'li@baosteel.com', address: '上海市宝山区', creditRating: 'A', status: '启用', remark: '钢材主要供应商', _createTime: '2025-01-10 10:00:00', createUser: 'admin', _updateTime: '2025-01-10 10:00:00' },
  { id: '3', supplierCode: 'SUP-003', supplierName: '苏州精密外协加工厂', supplierType: '外协加工', contactPerson: '王厂长', contactPhone: '13712348765', contactEmail: 'wang@sz-outsource.com', address: '苏州市工业园区', creditRating: 'B', status: '启用', remark: '热处理外协', _createTime: '2025-02-15 10:00:00', createUser: 'admin', _updateTime: '2025-02-15 10:00:00' },
  { id: '4', supplierCode: 'SUP-004', supplierName: '深圳硬质合金刀具厂', supplierType: '刀具', contactPerson: '陈工', contactPhone: '13698765432', contactEmail: 'chen@sz-carbide.com', address: '深圳市南山区', creditRating: 'B', status: '启用', remark: '', _createTime: '2025-03-01 10:00:00', createUser: 'admin', _updateTime: '2025-03-01 10:00:00' },
  { id: '5', supplierCode: 'SUP-005', supplierName: '无锡不锈钢材料公司', supplierType: '原材料', contactPerson: '刘经理', contactPhone: '13512345678', contactEmail: 'liu@wx-steel.com', address: '无锡市新区', creditRating: 'A', status: '启用', remark: '不锈钢材料', _createTime: '2025-03-05 10:00:00', createUser: 'admin', _updateTime: '2025-03-05 10:00:00' },
  { id: '6', supplierCode: 'SUP-006', supplierName: '南京量具仪器有限公司', supplierType: '刀具', contactPerson: '赵总', contactPhone: '13498765432', contactEmail: 'zhao@nj-gauge.com', address: '南京市江宁区', creditRating: 'B', status: '启用', remark: '', _createTime: '2025-03-10 10:00:00', createUser: 'admin', _updateTime: '2025-03-10 10:00:00' },
  { id: '7', supplierCode: 'SUP-007', supplierName: '浙江铝业集团', supplierType: '原材料', contactPerson: '孙经理', contactPhone: '13387654321', contactEmail: 'sun@zj-aluminum.com', address: '杭州市萧山区', creditRating: 'C', status: '停用', remark: '质量不稳定已暂停合作', _createTime: '2025-04-01 10:00:00', createUser: 'admin', _updateTime: '2025-04-01 10:00:00' },
  { id: '8', supplierCode: 'SUP-008', supplierName: '常州机械外协中心', supplierType: '外协加工', contactPerson: '周总', contactPhone: '13212348765', contactEmail: 'zhou@cz-mech.com', address: '常州市新北区', creditRating: 'A', status: '启用', remark: '机械加工外协', _createTime: '2025-04-10 10:00:00', createUser: 'admin', _updateTime: '2025-04-10 10:00:00' },
]

export async function getSupplierList(params?: PageParams & { supplierType?: string; status?: string; search?: string }): Promise<PageResponse<Supplier>> {
  const { page = 1, size = 15, supplierType, status, search } = params || {}
  await new Promise(r => setTimeout(r, 300))

  let filtered = [...mockData]
  if (supplierType && supplierType !== 'all') filtered = filtered.filter(i => i.supplierType === supplierType)
  if (status && status !== 'all') filtered = filtered.filter(i => i.status === status)
  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(i => i.supplierCode.toLowerCase().includes(s) || i.supplierName.toLowerCase().includes(s) || i.contactPerson.toLowerCase().includes(s))
  }

  const total = filtered.length
  const start = (page - 1) * size
  return { list: filtered.slice(start, start + size), total, page, size, totalPages: Math.ceil(total / size) }
}

export async function createSupplier(data: Partial<Supplier>): Promise<Supplier> {
  await new Promise(r => setTimeout(r, 200))
  return { id: Date.now().toString(), ...data } as Supplier
}

export async function updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
  await new Promise(r => setTimeout(r, 200))
  const item = mockData.find(i => i.id === id)
  return { ...item, ...data } as Supplier
}

export async function deleteSupplier(_id: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 200))
  return true
}
