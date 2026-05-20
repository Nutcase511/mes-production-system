export type ToolType = '铣刀' | '车刀' | '钻头' | '铰刀' | '镗刀' | '丝锥' | '其他'
export type LifeUnit = '小时' | '次数'
export type ToolStatus = '在库' | '使用中' | '维修中' | '已报废'

export interface Tool {
  id: string
  toolCode: string
  toolName: string
  toolType: ToolType
  specification: string
  coating: string
  manufacturer: string
  applicableEquipment: string[]
  standardLife: number
  currentLife: number
  lifeUnit: LifeUnit
  status: ToolStatus
  warehouseId: string
  location: string
  remark: string
  _createTime: string
  createUser: string
  _updateTime: string
}
