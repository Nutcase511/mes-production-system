// 质量相关类型定义

export type CheckType = 'first' | 'patrol' | 'final'  // 首检/巡检/终检
export type CheckResult = '合格' | '返修' | '报废'
export type DefectLevel = 'Class I' | 'Class II' | 'Class III'

export interface QualityCheck {
  id: string
  checkId: string           // 检验编号
  woId: string              // 跟单编号
  batchNo: string
  checkType: CheckType      // 首检/巡检/终检
  inspector: string
  checkTime: string
  items: CheckItem[]
  processRecords?: any[]    // 工序记录数据（用于保存完整的工序信息）
  cpk?: number
  result: CheckResult
  defectLevel?: DefectLevel
  spc?: SPCData             // SPC数据
  remarks?: string          // 备注
}

export interface CheckItem {
  itemNo: string
  itemName: string
  method: string
  standard: string
  measuredValue: number
  qualified: boolean
  tolerance?: {             // 公差
    upper: number
    lower: number
  }
  processRecordData?: any   // 工序记录数据（用于保存完整的工序信息）
}

// SPC统计数据
export interface SPCData {
  mean: number              // 均值
  stdDev: number           // 标准差
  ucl: number              // 上控制限
  lcl: number              // 下控制限
  cp: number               // 过程能力指数
  cpk: number              // 过程能力指数
  samples: number[]         // 样本数据
  outOfControl?: number[]   // 超出控制限的样本索引
}

// SPC控制图类型
export type ControlChartType = 'xbar-r' | 'xbar-s' | 'p' | 'u' | 'individual'

// SPC分析结果
export interface SPCAnalysis {
  chartType: ControlChartType
  data: SPCData
  warnings: SPCWarning[]    // 预警信息
  processCapability: ProcessCapability  // 过程能力评级
}

export interface SPCWarning {
  type: 'out_of_control' | 'trend' | 'cycle' | 'clustering'
  message: string
  severity: 'info' | 'warning' | 'error'
  sampleIndex?: number
}

export interface ProcessCapability {
  cp: number
  cpk: number
  rating: 'excellent' | 'good' | 'fair' | 'poor' | 'inadequate'
  description: string
}

// 质量追溯链
export interface QualityTraceChain {
  batchNo: string
  productCode: string
  productName: string

  // 原料信息
  rawMaterials: RawMaterialBatch[]

  // 生产过程
  productionProcess: {
    orderId: string
    workOrders: {
      woId: string
      processName: string
      operator: string
      equipment: string
      timeRange: { start: string; end?: string }
    }[]
  }[]

  // 检验记录
  qualityChecks: {
    checkId: string
    checkType: CheckType
    inspector: string
    checkTime: string
    result: CheckResult
  }[]

  // 成品信息
  finalProduct: {
    batchNo: string
    quantity: number
    qualityGrade: string
    completionDate: string
  }
}

export interface RawMaterialBatch {
  materialCode: string
  materialName: string
  batchNo: string
  supplier: string
  batchDate: string
  quantity: number
  unit: string
}
