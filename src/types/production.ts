// 生产相关类型定义

export type OrderStatus =
  | '已创建'
  | '准备中'
  | '已就绪'
  | '生产中'
  | '已完成'
  | '已取消'

export type WorkOrderStatus =
  | '待开始'
  | '进行中'
  | '暂停中'
  | '已完成'

export type OrderType = 'batch' | 'develop' | 'rework'
export type RouteMatchStatus = 'matched' | 'partial' | 'none'

export interface ProductionOrder {
  id: string
  orderNo: string           // 订单编号
  productCode: string       // 产品编码
  productName: string       // 产品名称
  orderType: OrderType      // 订单类型
  quantity: number          // 数量
  urgency: 1 | 2 | 3 | 4 | 5  // 紧急程度
  status: OrderStatus
  progress: number          // 进度百分比
  deliveryDate: string      // 交货期
  createdAt: string         // 创建时间
  routeMatchStatus?: RouteMatchStatus  // 调度匹配状态
  routeId?: string          // 匹配的调度路线ID
  workOrders?: WorkOrder[]  // 关联跟单
}

export interface WorkOrder {
  id: string
  woId: string              // 跟单编号
  orderId: string           // 关联订单
  productCode: string
  productName: string
  batchNo: string           // 批次号
  processNo: string         // 工序号
  processName: string       // 工序名称
  equipment: string         // 设备
  operator: string          // 操作工
  status: WorkOrderStatus
  startTime?: string
  endTime?: string
  inputQty: number          // 投入数量
  outputQty: number         // 产出数量
  qualifiedQty: number      // 合格数
  defectQty: number         // 不合格数
  processId?: string        // 工序ID
}

export interface ProcessStep {
  id: string
  no: string                // 工序号
  name: string              // 工序名称
  status: string
  statusText?: string       // 状态文本
  hasWarning?: boolean      // 是否有异常
  warningText?: string      // 异常描述
}
