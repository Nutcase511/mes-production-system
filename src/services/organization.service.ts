import type { PageParams, PageResponse } from '@/types/api'
import type { Organization, OrgType, OrgStatus } from '@/types/organization'

export const ORG_TYPES: { value: OrgType; label: string }[] = [
  { value: '部门', label: '部门' },
  { value: '车间', label: '车间' },
  { value: '班组', label: '班组' },
]

export const ORG_STATUS: { value: OrgStatus; label: string; color: string }[] = [
  { value: '启用', label: '启用', color: '#52c41a' },
  { value: '停用', label: '停用', color: '#999' },
]

const mockData: Organization[] = [
  { id: '1', orgCode: 'ORG-001', orgName: '生产制造部', orgType: '部门', parentId: '', level: 1, leader: '王建国', status: '启用', sort: 1, _createTime: '2025-01-01 08:00:00', createUser: 'admin', _updateTime: '2025-01-01 08:00:00' },
  { id: '2', orgCode: 'ORG-002', orgName: '质量管理部', orgType: '部门', parentId: '', level: 1, leader: '李明辉', status: '启用', sort: 2, _createTime: '2025-01-01 08:00:00', createUser: 'admin', _updateTime: '2025-01-01 08:00:00' },
  { id: '3', orgCode: 'ORG-003', orgName: '技术调度部', orgType: '部门', parentId: '', level: 1, leader: '张志远', status: '启用', sort: 3, _createTime: '2025-01-01 08:00:00', createUser: 'admin', _updateTime: '2025-01-01 08:00:00' },
  { id: '4', orgCode: 'WS-001', orgName: '机加工车间', orgType: '车间', parentId: '1', level: 2, leader: '赵强', status: '启用', sort: 1, _createTime: '2025-01-15 09:00:00', createUser: 'admin', _updateTime: '2025-01-15 09:00:00' },
  { id: '5', orgCode: 'WS-002', orgName: '热处理车间', orgType: '车间', parentId: '1', level: 2, leader: '刘海波', status: '启用', sort: 2, _createTime: '2025-01-15 09:00:00', createUser: 'admin', _updateTime: '2025-01-15 09:00:00' },
  { id: '6', orgCode: 'WS-003', orgName: '装配车间', orgType: '车间', parentId: '1', level: 2, leader: '陈志刚', status: '启用', sort: 3, _createTime: '2025-01-15 09:00:00', createUser: 'admin', _updateTime: '2025-01-15 09:00:00' },
  { id: '7', orgCode: 'TM-001', orgName: '数控一班', orgType: '班组', parentId: '4', level: 3, leader: '孙伟', status: '启用', sort: 1, _createTime: '2025-02-01 08:00:00', createUser: 'admin', _updateTime: '2025-02-01 08:00:00' },
  { id: '8', orgCode: 'TM-002', orgName: '数控二班', orgType: '班组', parentId: '4', level: 3, leader: '周磊', status: '启用', sort: 2, _createTime: '2025-02-01 08:00:00', createUser: 'admin', _updateTime: '2025-02-01 08:00:00' },
  { id: '9', orgCode: 'TM-003', orgName: '磨削班', orgType: '班组', parentId: '4', level: 3, leader: '吴刚', status: '启用', sort: 3, _createTime: '2025-02-01 08:00:00', createUser: 'admin', _updateTime: '2025-02-01 08:00:00' },
  { id: '10', orgCode: 'TM-004', orgName: '热处理一班', orgType: '班组', parentId: '5', level: 3, leader: '马超', status: '启用', sort: 1, _createTime: '2025-02-01 08:00:00', createUser: 'admin', _updateTime: '2025-02-01 08:00:00' },
  { id: '11', orgCode: 'TM-005', orgName: '装配一班', orgType: '班组', parentId: '6', level: 3, leader: '黄鹏', status: '启用', sort: 1, _createTime: '2025-02-01 08:00:00', createUser: 'admin', _updateTime: '2025-02-01 08:00:00' },
  { id: '12', orgCode: 'TM-006', orgName: '检验一班', orgType: '班组', parentId: '2', level: 2, leader: '郑丽', status: '启用', sort: 1, _createTime: '2025-02-01 08:00:00', createUser: 'admin', _updateTime: '2025-02-01 08:00:00' },
  { id: '13', orgCode: 'WS-004', orgName: '表面处理车间', orgType: '车间', parentId: '1', level: 2, leader: '林峰', status: '停用', sort: 4, _createTime: '2025-03-01 08:00:00', createUser: 'admin', _updateTime: '2025-03-01 08:00:00' },
  { id: '14', orgCode: 'ORG-004', orgName: '仓储物流部', orgType: '部门', parentId: '', level: 1, leader: '何建军', status: '启用', sort: 4, _createTime: '2025-01-01 08:00:00', createUser: 'admin', _updateTime: '2025-01-01 08:00:00' },
  { id: '15', orgCode: 'ORG-005', orgName: '设备管理部', orgType: '部门', parentId: '', level: 1, leader: '杨志明', status: '启用', sort: 5, _createTime: '2025-01-01 08:00:00', createUser: 'admin', _updateTime: '2025-01-01 08:00:00' },
]

export async function getOrganizationList(params?: PageParams & { orgType?: string; status?: string; search?: string }): Promise<PageResponse<Organization>> {
  const { page = 1, size = 15, orgType, status, search } = params || {}
  await new Promise(r => setTimeout(r, 300))

  let filtered = [...mockData]
  if (orgType && orgType !== 'all') filtered = filtered.filter(i => i.orgType === orgType)
  if (status && status !== 'all') filtered = filtered.filter(i => i.status === status)
  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(i => i.orgCode.toLowerCase().includes(s) || i.orgName.toLowerCase().includes(s) || i.leader.toLowerCase().includes(s))
  }

  const total = filtered.length
  const start = (page - 1) * size
  return { list: filtered.slice(start, start + size), total, page, size, totalPages: Math.ceil(total / size) }
}

export async function createOrganization(data: Partial<Organization>): Promise<Organization> {
  await new Promise(r => setTimeout(r, 200))
  return { id: Date.now().toString(), ...data } as Organization
}

export async function updateOrganization(id: string, data: Partial<Organization>): Promise<Organization> {
  await new Promise(r => setTimeout(r, 200))
  const item = mockData.find(i => i.id === id)
  return { ...item, ...data } as Organization
}

export async function deleteOrganization(_id: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 200))
  return true
}
