// 研制生产相关类型定义

export type DevelopmentStatus = '待评估' | '技术评估中' | '调度验证中' | '试制中' | '待转量产' | '已完成' | '已取消'

export type DevelopmentPhase = '技术评估' | '调度验证' | '试制生产' | '转量产'

/** 研制订单 */
export interface DevelopmentOrder {
  id: string
  orderId: string                // 研制订单编号
  productId: string              // 产品ID
  productName: string            // 产品名称
  productType: '新产品' | '特殊材料' | '新调度' | '定制产品'
  quantity: number               // 研制数量
  urgency: 1 | 2 | 3 | 4 | 5     // 紧急程度
  status: DevelopmentStatus      // 状态
  currentPhase: DevelopmentPhase // 当前阶段
  startDate: string              // 开始日期
  expectedDate: string           // 预计完成日期
  completedDate?: string         // 实际完成日期
  customerName?: string          // 客户名称
  specialRequirements?: string   // 特殊要求
  techEvaluation?: TechEvaluation // 技术评估
  processValidation?: ProcessValidation // 调度验证
  trialProduction?: TrialProduction // 试制生产
  massConversion?: MassConversion // 转量产
  createdAt: string
  creatorId: string
  creatorName: string
}

/** 技术评估 */
export interface TechEvaluation {
  id: string
  orderId: string
  evaluatorId: string            // 评估人ID
  evaluatorName: string          // 评估人姓名
  evaluationDate: string         // 评估日期
  feasibilityScore: number       // 可行性评分 (1-10)
  riskLevel: '低' | '中' | '高'   // 风险等级
  riskDescription?: string       // 风险描述
  technicalRequirements: string  // 技术要求
  requiredEquipment: string[]    // 所需设备
  requiredMaterials: string[]    // 所需材料
  estimatedCost: number          // 预估成本
  recommendation: '可行' | '需改进' | '不可行' // 建议
  remarks?: string
  status: '待评估' | '已完成'
}

/** 调度验证 */
export interface ProcessValidation {
  id: string
  orderId: string
  validatorId: string            // 验证人ID
  validatorName: string          // 验证人姓名
  validationDate: string         // 验证日期
  processRoute: string           // 调度路线
  testSamples: number            // 试样数量
  qualifiedSamples: number       // 合格数量
  passRate: number               // 合格率
  processParams: ProcessParam[]  // 调度参数
  issues: string[]               // 发现的问题
  improvements: string[]         // 改进措施
  result: '合格' | '需调整' | '不合格'
  status: '待验证' | '进行中' | '已完成'
}

/** 调度参数 */
export interface ProcessParam {
  name: string
  value: string
  unit: string
  tolerance: string
}

/** 试制生产 */
export interface TrialProduction {
  id: string
  orderId: string
  batchNo: string                // 试制批次号
  quantity: number               // 试制数量
  startDate: string              // 开始日期
  endDate?: string               // 结束日期
  qualifiedQuantity: number      // 合格数量
  defectQuantity: number         // 缺陷数量
  qualityReport?: string         // 质量报告
  status: '待开始' | '进行中' | '已完成'
}

/** 转量产 */
export interface MassConversion {
  id: string
  orderId: string
  conversionDate: string         // 转量产日期
  approvedQuantity: number       // 批准量产数量
  processRouteId: string         // 调度路线ID
  processRouteName: string       // 调度路线名称
  approverId: string             // 批准人ID
  approverName: string           // 批准人姓名
  remarks?: string
  status: '待审批' | '已批准' | '已拒绝'
}
