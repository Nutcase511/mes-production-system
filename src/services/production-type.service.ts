/**
 * 生产类型判定服务
 * 实现自动判定订单生产类型的逻辑
 */

import {
  PRODUCTION_TYPE_RULES,
  PRODUCTION_TYPE_INFO,
  type OrderDataForDetermination,
  type DeterminationResult,
  type DeterminationRecord,
  type ProductionType
} from '@/config/production-type-rules'

/**
 * 根据订单数据判定生产类型
 */
export function determineProductionType(orderData: OrderDataForDetermination): DeterminationResult {
  let bestMatch: DeterminationResult | null = null
  let highestPriority = Infinity

  // 按优先级从高到低评估规则
  const sortedRules = [...PRODUCTION_TYPE_RULES].sort((a, b) => a.priority - b.priority)

  for (const rule of sortedRules) {
    // 跳过优先级更低的规则（如果已经找到匹配）
    if (rule.priority > highestPriority) {
      break
    }

    // 计算匹配分数
    let score = 0
    const matchedReasons: string[] = []

    for (const condition of rule.conditions) {
      const fieldValue = (orderData as any)[condition.field]
      if (fieldValue === condition.value) {
        score += condition.weight || 1
        matchedReasons.push(getConditionLabel(condition.field))
      }
    }

    // 检查是否达到最小分数要求
    const minScore = rule.minScore || 0
    if (score >= minScore) {
      const confidence = Math.min(score / 10, 1) // 归一化到0-1

      bestMatch = {
        type: rule.type,
        confidence,
        reasons: matchedReasons,
        score
      }

      highestPriority = rule.priority
      break // 找到匹配后停止
    }
  }

  // 如果没有匹配，默认为常规生产
  if (!bestMatch) {
    bestMatch = {
      type: 'normal',
      confidence: 0.7,
      reasons: ['常规生产流程'],
      score: 0
    }
  }

  return bestMatch
}

/**
 * 获取条件标签（中文描述）
 */
function getConditionLabel(field: string): string {
  const labels: Record<string, string> = {
    isNewProduct: '新产品标记',
    requiresSpecialProcess: '需要特殊调度',
    hasCustomMaterial: '使用定制材料',
    isPrototype: '原型试制',
    capacityOverload: '产能超负荷',
    requiresExternalEquipment: '需要外部设备',
    isSpecialProcess: '特殊调度要求',
    costEffectiveness: '成本效益优势'
  }
  return labels[field] || field
}

/**
 * 创建判定记录
 */
export function createDeterminationRecord(
  orderData: OrderDataForDetermination,
  determination: DeterminationResult
): DeterminationRecord {
  return {
    orderId: orderData.id,
    orderNo: orderData.orderNo,
    originalType: determination.type,
    finalType: determination.type,
    determinationBasis: JSON.stringify({
      score: determination.score,
      matchedConditions: determination.reasons
    }),
    confidence: determination.confidence,
    reasons: determination.reasons,
    status: 'pending'
  }
}

/**
 * 更新判定记录（人工修正）
 */
export function updateDeterminationRecord(
  record: DeterminationRecord,
  finalType: ProductionType,
  determiner: string,
  remark?: string
): DeterminationRecord {
  return {
    ...record,
    finalType,
    determiner,
    determinationTime: new Date(),
    remark,
    status: record.originalType === finalType ? 'confirmed' : 'modified'
  }
}

/**
 * 获取生产类型信息
 */
export function getProductionTypeInfo(type: ProductionType) {
  return PRODUCTION_TYPE_INFO[type]
}

/**
 * 验证判定数据完整性
 */
export function validateDeterminationData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.orderId) {
    errors.push('缺少订单ID')
  }

  if (!data.orderNo) {
    errors.push('缺少订单编号')
  }

  if (!data.finalType) {
    errors.push('未选择生产类型')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 格式化判定结果为可读文本
 */
export function formatDeterminationResult(result: DeterminationResult): string {
  const typeInfo = getProductionTypeInfo(result.type)
  const confidencePercent = Math.round(result.confidence * 100)

  return `${typeInfo.label}（置信度：${confidencePercent}%）
判定依据：
${result.reasons.map(r => `  ✓ ${r}`).join('\n')}
${result.reasons.length === 0 ? '  （默认判定）' : ''}`
}

// 重新导出类型
export type { ProductionType, OrderDataForDetermination, DeterminationResult, DeterminationRecord }
