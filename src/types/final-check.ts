// 终检相关类型定义

export type FinalCheckResult = '合格' | '工返' | '报废'

export type DefectSeverity = '轻微' | '严重' | '致命'

/** 终检记录 */
export interface FinalCheckRecord {
  id: string
  checkId: string                // 检验编号 QI-02
  batchNo: string                // 批次号
  workOrderId: string            // 作业跟单ID
  workOrderNo: string            // 作业跟单号
  productId: string              // 产品ID
  productName: string            // 产品名称
  processName: string            // 终检工序
  inspectorId: string            // 检验员ID
  inspectorName: string          // 检验员姓名
  checkDate: string              // 检验日期
  checkItems: FinalCheckItem[]   // 检验项目
  result: FinalCheckResult       // 判定结果
  defectDescription?: string     // 缺陷描述
  defectSeverity?: DefectSeverity // 缺陷等级
  deviationValue?: number        // 偏差值
  presetAmplitude?: number       // 预置幅度
  parentBatchNo?: string         // 父批次号（工返关联）
  childBatchNo?: string          // 子批次号（工返关联）
  materialWriteOff?: boolean     // 物料核销标记
  remark?: string                // 备注
  createdAt: string
  status: '待检验' | '已完成'
}

/** 终检检验项 */
export interface FinalCheckItem {
  itemNo: string
  itemName: string               // 检验项目名称
  standard: string               // 标准值
  upperLimit: number             // 上限
  lowerLimit: number             // 下限
  measuredValue: number          // 实测值
  unit: string                   // 单位
  qualified: boolean             // 是否合格
  deviation: number              // 偏差
}

/** 父子批次关联 */
export interface BatchRelation {
  id: string
  parentBatchNo: string          // 父批次号
  childBatchNo: string           // 子批次号
  reason: string                 // 工返原因
  createdAt: string
  status: '进行中' | '已完成' | '已关闭'
}

/** 预置幅度配置 */
export interface PresetAmplitudeConfig {
  id: string
  productId: string              // 产品ID
  productName: string            // 产品名称
  itemNo: string                 // 检验项编号
  itemName: string               // 检验项名称
  amplitude: number              // 预置幅度
  unit: string                   // 单位
}
