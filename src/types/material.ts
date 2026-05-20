export type MaterialType = '原材料' | '刀具' | '量具' | '辅料'
export type MaterialStatus = '启用' | '停用'

export interface Material {
  id: string
  materialCode: string
  materialName: string
  materialType: MaterialType
  specification: string
  unit: string
  category: string
  technicalStandard: string
  safetyStock: number
  leadTime: number
  status: MaterialStatus
  remark: string
  _createTime: string
  createUser: string
  _updateTime: string
}
