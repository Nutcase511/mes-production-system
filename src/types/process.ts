// 调度管理相关类型定义

export interface ProcessRoute {
  id: string
  routeCode: string         // 调度路线编码
  routeName: string         // 调度路线名称
  productCode: string       // 产品编码
  productName: string       // 产品名称
  version: string           // 版本号
  processes: Process[]      // 工序列表
  lastUsed?: string         // 最后使用日期
  matchScore?: number       // 匹配度 (0-1)
  status?: 'active' | 'archived'  // 状态
}

export interface Process {
  id: string
  processNo: string         // 工序号 (OP10, OP20...)
  processName: string       // 工序名称
  equipmentType: string     // 设备类型要求
  cycleTime: number         // 标准工时 (分钟)
  inspectionRule: InspectionRule  // 检验规则
  description?: string      // 工序描述
}

export interface InspectionRule {
  requireFirstCheck: boolean    // 是否需要首检
  requirePatrolCheck: boolean   // 是否需要巡检
  patrolInterval: number        // 巡检间隔 (件数)
  requireFinalCheck: boolean    // 是否需要终检
  checkItems?: string[]         // 检验项目列表
}

// 调度匹配结果
export interface RouteMatchResult {
  type: 'full' | 'partial' | 'none'
  routes: ProcessRoute[]
  suggestions?: string[]        // 建议
}

// 派工单类型
export interface DispatchOrder {
  id: string
  dispatchNo: string        // 派工单号
  orderId: string           // 订单ID
  processId: string         // 工序ID
  processNo: string         // 工序号
  processName: string       // 工序名称
  equipmentId?: string      // 设备ID
  equipmentName?: string    // 设备名称
  operatorId?: string       // 操作工ID
  operatorName?: string     // 操作工名称
  plannedQty: number        // 计划数量
  status: DispatchStatus
  dispatchTime?: string     // 派工时间
  startTime?: string        // 开始时间
  endTime?: string          // 完成时间
  materialStatus?: 'ready' | 'shortage'  // 物料状态
}

export type DispatchStatus =
  | 'pending'       // 待派工
  | 'dispatched'    // 已派工
  | 'confirmed'     // 已确认
  | 'in-progress'   // 进行中
  | 'completed'     // 已完成
  | 'cancelled'     // 已取消
