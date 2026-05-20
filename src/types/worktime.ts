// 工时相关类型定义

export type WorkTimeStatus = '待核销' | '已核销' | '已取消'

export type WorkTimeType = '正常工时' | '加班工时' | '休息日工时' | '误餐工时'

/** 工时定额 */
export interface WorkTimeQuota {
  id: string
  productId: string          // 产品ID
  productName: string        // 产品名称
  processId: string          // 工序ID
  processName: string        // 工序名称
  quotaHours: number        // 定额工时（小时）
  unit: string               // 单位（件/批）
  effectiveDate: string      // 生效日期
  status: '启用' | '停用'
}

/** 工时记录/报工 */
export interface WorkTimeRecord {
  id: string
  recordId: string           // 记录编号
  workOrderId: string        // 作业跟单ID
  workOrderNo: string        // 作业跟单号
  productId: string          // 产品ID
  productName: string        // 产品名称
  processId: string          // 工序ID
  processName: string        // 工序名称
  workerId: string           // 工人ID
  workerName: string         // 工人姓名
  equipmentId: string         // 设备ID
  equipmentName: string      // 设备名称
  workDate: string           // 工作日期
  startTime: string          // 开始时间
  endTime: string            // 结束时间
  workHours: number          // 工时（小时）
  workTimeType: WorkTimeType // 工时类型
  outputQuantity: number     // 产出数量
  qualifiedQuantity: number  // 合格数量
  status: WorkTimeStatus     // 状态
  remark?: string            // 备注
  createdAt: string          // 创建时间
  verifiedAt?: string        // 核销时间
  verifiedBy?: string        // 核销人
}

/** 工时核销记录 */
export interface WorkTimeVerification {
  id: string
  verificationId: string      // 核销编号
  recordId: string           // 工时记录ID
  recordIds: string[]        // 批量核销的记录IDs
  workOrderId: string        // 作业跟单ID
  totalHours: number         // 核销工时总数
  verifierId: string         // 核销人ID
  verifierName: string       // 核销人姓名
  verificationDate: string   // 核销日期
  status: '已核销' | '已取消'
  remark?: string            // 备注
}

/** 工时统计 */
export interface WorkTimeStats {
  totalHours: number         // 总工时
  normalHours: number        // 正常工时
  overtimeHours: number      // 加班工时
  restHours: number          // 休息日工时
  verifiedHours: number     // 已核销工时
  pendingHours: number       // 待核销工时
  workerStats: WorkerTimeStats[]
  equipmentStats: EquipmentTimeStats[]
  dailyStats: DailyTimeStats[]
}

export interface WorkerTimeStats {
  workerId: string
  workerName: string
  totalHours: number
  outputQuantity: number
  qualifiedQuantity: number
  qualifiedRate: number
}

export interface EquipmentTimeStats {
  equipmentId: string
  equipmentName: string
  totalHours: number
  utilization: number
}

export interface DailyTimeStats {
  date: string
  totalHours: number
  outputQuantity: number
}
