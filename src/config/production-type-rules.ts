/**
 * 生产类型判定规则配置
 * 用于自动判定订单的生产类型（常规/研制/外协）
 */

export type ProductionType = 'development' | 'outsourcing' | 'normal'

export type ProductionTypeInfo = {
  label: string
  color: string
  description: string
}

export const PRODUCTION_TYPE_INFO: Record<ProductionType, ProductionTypeInfo> = {
  development: {
    label: '研制生产',
    color: 'text-purple-400',
    description: '新产品、特殊调度或定制材料的生产'
  },
  outsourcing: {
    label: '外协生产',
    color: 'text-orange-400',
    description: '需要外部加工或产能不足时外发生产'
  },
  normal: {
    label: '常规生产',
    color: 'text-blue-400',
    description: '标准产品的正常生产流程'
  }
}

export interface DeterminationCondition {
  /** 字段名 */
  field: string
  /** 期望值 */
  value: any
  /** 权重（用于评分） */
  weight?: number
}

export interface DeterminationRule {
  /** 生产类型 */
  type: ProductionType
  /** 判定条件 */
  conditions: DeterminationCondition[]
  /** 优先级（数字越小优先级越高） */
  priority: number
  /** 最小匹配分数 */
  minScore?: number
}

/**
 * 生产类型判定规则
 */
export const PRODUCTION_TYPE_RULES: DeterminationRule[] = [
  {
    type: 'development',
    priority: 1,
    minScore: 2,
    conditions: [
      { field: 'isNewProduct', value: true, weight: 3 },
      { field: 'requiresSpecialProcess', value: true, weight: 2 },
      { field: 'hasCustomMaterial', value: true, weight: 2 },
      { field: 'isPrototype', value: true, weight: 3 }
    ]
  },
  {
    type: 'outsourcing',
    priority: 2,
    minScore: 1,
    conditions: [
      { field: 'capacityOverload', value: true, weight: 2 },
      { field: 'requiresExternalEquipment', value: true, weight: 2 },
      { field: 'isSpecialProcess', value: true, weight: 1 },
      { field: 'costEffectiveness', value: 'outsourcing', weight: 1 }
    ]
  },
  {
    type: 'normal',
    priority: 3,
    minScore: 0,
    conditions: []
  }
]

/**
 * 判定结果
 */
export interface DeterminationResult {
  /** 判定的生产类型 */
  type: ProductionType
  /** 置信度（0-1） */
  confidence: number
  /** 判定依据（匹配的条件） */
  reasons: string[]
  /** 分数 */
  score: number
}

/**
 * 判定记录
 */
export interface DeterminationRecord {
  id?: string
  /** 关联订单ID */
  orderId: string
  /** 订单编号 */
  orderNo: string
  /** 系统判定的类型 */
  originalType: ProductionType
  /** 最终确认的类型 */
  finalType?: ProductionType
  /** 判定依据（JSON格式） */
  determinationBasis: string
  /** 置信度 */
  confidence: number
  /** 判定原因 */
  reasons: string[]
  /** 判定人 */
  determiner?: string
  /** 判定时间 */
  determinationTime?: Date
  /** 备注 */
  remark?: string
  /** 状态 */
  status: 'pending' | 'confirmed' | 'modified'
}

/**
 * 订单数据（用于判定）
 */
export interface OrderDataForDetermination {
  id: string
  orderNo: string
  productName: string
  customerName: string
  /** 是否新产品 */
  isNewProduct?: boolean
  /** 是否需要特殊调度 */
  requiresSpecialProcess?: boolean
  /** 是否使用定制材料 */
  hasCustomMaterial?: boolean
  /** 是否原型 */
  isPrototype?: boolean
  /** 产能是否超负荷 */
  capacityOverload?: boolean
  /** 是否需要外部设备 */
  requiresExternalEquipment?: boolean
  /** 是否特殊调度 */
  isSpecialProcess?: boolean
  /** 成本效益 */
  costEffectiveness?: 'internal' | 'outsourcing'
  /** 产品类型 */
  productType?: string
  /** 调度复杂度 */
  processComplexity?: 'low' | 'medium' | 'high'
}
