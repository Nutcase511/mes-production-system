// 周期不足预警
export interface InsufficientResult {
  insufficient: boolean
  shortageDays?: number
  suggestions?: string[]
}

export function checkCycleInsufficient(order: any): InsufficientResult {
  const remaining = new Date(order.deliveryDate).getTime() - Date.now()
  const remainingDays = Math.ceil(remaining / (1000 * 60 * 60 * 24))
  const requiredDays = order.quantity / 100 // 简化计算
  
  if (remainingDays < requiredDays) {
    return {
      insufficient: true,
      shortageDays: requiredDays - remainingDays,
      suggestions: ['增加资源', '加班生产', '分批交货']
    }
  }
  return { insufficient: false }
}

// 紧急插单评估
export interface UrgentOrderAssessment {
  canInsert: boolean
  impactLevel: 'low' | 'medium' | 'high'
  affectedOrders: string[]
  estimatedDelay: number
  recommendations: string[]
}

export function assessUrgentOrder(
  newOrder: any,
  existingOrders: any[]
): UrgentOrderAssessment {
  // 简化评估逻辑
  const highPriorityCount = existingOrders.filter(o => o.priority === 'high').length
  
  if (highPriorityCount >= 3) {
    return {
      canInsert: true,
      impactLevel: 'high',
      affectedOrders: existingOrders.slice(0, 3).map(o => o.id),
      estimatedDelay: 2,
      recommendations: ['建议调整其他订单优先级', '考虑增加生产资源']
    }
  }
  
  if (highPriorityCount >= 1) {
    return {
      canInsert: true,
      impactLevel: 'medium',
      affectedOrders: existingOrders.slice(0, 1).map(o => o.id),
      estimatedDelay: 1,
      recommendations: ['建议与客户沟通交期']
    }
  }
  
  return {
    canInsert: true,
    impactLevel: 'low',
    affectedOrders: [],
    estimatedDelay: 0,
    recommendations: ['可直接插入生产计划']
  }
}

// 人工干预记录
export interface ManualIntervention {
  id: string
  orderId: string
  type: 'reschedule' | 'reassign' | 'priority_change' | 'resource_adjust'
  reason: string
  oldValue: any
  newValue: any
  operator: string
  timestamp: Date
}

export function recordIntervention(
  orderId: string,
  type: ManualIntervention['type'],
  reason: string,
  oldValue: any,
  newValue: any,
  operator: string
): ManualIntervention {
  return {
    id: `MI-${Date.now()}`,
    orderId,
    type,
    reason,
    oldValue,
    newValue,
    operator,
    timestamp: new Date()
  }
}
