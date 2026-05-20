// 库位管理类型定义

export type LocationStatus = 'idle' | 'occupied' | 'locked'
export type LocationType = 'raw' | 'semi-finished' | 'finished' | 'tool' | 'fixture'

export interface InventoryLocation {
  id: string
  locationCode: string        // 库位编码
  locationName: string        // 库位名称
  warehouseArea: string        // 库区
  locationType: LocationType  // 库位类型
  capacity: number            // 容量
  currentQuantity: number    // 当前数量
  status: LocationStatus     // 状态：idle-空闲/占用/锁定
  remark?: string             // 备注
  createTime?: string         // 创建时间
  updateTime?: string         // 更新时间
}

// 用于前端显示的库位数据
export interface InventoryLocationDisplay {
  id: string
  locationCode: string
  locationName: string
  warehouseArea: string
  locationType: string
  capacity: number
  currentQuantity: number
  status: LocationStatus
  remark?: string
}

// 创建/编辑库位表单数据
export interface InventoryLocationForm {
  locationCode: string
  locationName: string
  warehouseArea: string
  locationType: LocationType
  capacity: number
  remark?: string
}

// 库位统计
export interface LocationStats {
  total: number
  idle: number
  occupied: number
  locked: number
  utilizationRate: number
}

// 库区选项
export const WAREHOUSE_AREAS = [
  { value: 'A区', label: 'A区 - 原材料库' },
  { value: 'B区', label: 'B区 - 半成品库' },
  { value: 'C区', label: 'C区 - 成品库' },
  { value: 'D区', label: 'D区 - 工具库' },
  { value: 'E区', label: 'E区 - 夹具库' },
]

// 库位类型选项
export const LOCATION_TYPES = [
  { value: 'raw', label: '原材料' },
  { value: 'semi-finished', label: '半成品' },
  { value: 'finished', label: '成品' },
  { value: 'tool', label: '工具' },
  { value: 'fixture', label: '夹具' },
]

// 状态选项
export const LOCATION_STATUS = [
  { value: 'idle', label: '空闲', color: 'green' },
  { value: 'occupied', label: '占用', color: 'blue' },
  { value: 'locked', label: '锁定', color: 'red' },
]
