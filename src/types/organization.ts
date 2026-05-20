export type OrgType = '部门' | '车间' | '班组'
export type OrgStatus = '启用' | '停用'

export interface Organization {
  id: string
  orgCode: string
  orgName: string
  orgType: OrgType
  parentId: string
  level: number
  leader: string
  status: OrgStatus
  sort: number
  _createTime: string
  createUser: string
  _updateTime: string
}
