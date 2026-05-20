// 设备相关类型定义

export type EquipmentStatus =
  | '运行中'
  | '空闲'
  | '故障'
  | '保养'

export interface Equipment {
  id: string
  equipmentId: string       // 设备编号
  equipmentName: string
  equipmentType: string
  model: string
  status: EquipmentStatus
  location: string
  oee?: number              // 设备综合效率
  currentOperator?: string
  currentWorkOrder?: string
}
