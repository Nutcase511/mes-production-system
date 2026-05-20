/**
 * 批次管理服务
 * 处理批次号生成、批次关联等功能
 */

export interface BatchInfo {
  /** 批次号 */
  batchNo: string
  /** 订单ID */
  orderId: string
  /** 订单编号 */
  orderNo: string
  /** 工单ID */
  workOrderId: string
  /** 工单编号 */
  workOrderNo: string
  /** 产品编码 */
  productCode: string
  /** 产品名称 */
  productName: string
  /** 数量 */
  quantity: number
  /** 入库时间 */
  inboundTime: Date
  /** 操作人 */
  operator: string
}

export interface BatchRelation {
  id?: string
  /** 批次号 */
  batchNo: string
  /** 订单ID */
  orderId: string
  /** 订单编号 */
  orderNo: string
  /** 工单ID */
  workOrderId: string
  /** 工单编号 */
  workOrderNo: string
  /** 入库单ID */
  inboundId: string
  /** 入库时间 */
  inboundTime: Date
  /** 数量 */
  quantity: number
  /** 追溯链 */
  traceChain: any[]
  /** 创建时间 */
  createdAt: Date
}

/**
 * 生成批次号
 * 格式: B + 年月日 + 订单号后4位 + 流水号3位
 * 示例: B20240301001A001
 */
export function generateBatchNumber(
  orderNo: string,
  date: Date = new Date()
): string {
  // 格式化日期：yyyyMMdd
  const dateStr = formatDate(date, 'yyyyMMdd')

  // 提取订单号后4位
  const orderSuffix = (orderNo.slice(-4) + '0000').slice(0, 4)

  // 获取流水号（需要从数据库或计数器获取）
  const sequence = getNextSequence(orderNo)

  // 组合批次号
  const batchNo = `B${dateStr}${orderSuffix}${String(sequence).padStart(3, '0')}`

  return batchNo
}

/**
 * 格式化日期
 */
function formatDate(date: Date, format: string): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return format
    .replace('yyyy', String(year))
    .replace('MM', month)
    .replace('dd', day)
}

/**
 * 获取下一个流水号
 */
function getNextSequence(orderNo: string): number {
  // TODO: 从数据库或计数器获取
  // 这里使用随机数模拟
  return Math.floor(Math.random() * 1000)
}

/**
 * 创建批次信息
 */
export function createBatchInfo(params: {
  orderId: string
  orderNo: string
  workOrderId: string
  workOrderNo: string
  productCode: string
  productName: string
  quantity: number
  operator: string
}): BatchInfo {
  const batchNo = generateBatchNumber(params.orderNo)

  return {
    batchNo,
    orderId: params.orderId,
    orderNo: params.orderNo,
    workOrderId: params.workOrderId,
    workOrderNo: params.workOrderNo,
    productCode: params.productCode,
    productName: params.productName,
    quantity: params.quantity,
    inboundTime: new Date(),
    operator: params.operator
  }
}

/**
 * 保存批次关联
 */
export async function saveBatchRelation(
  relation: BatchRelation
): Promise<void> {
  // TODO: 保存到AIRIOT
}

/**
 * 根据批次号获取关联信息
 */
export async function getBatchRelation(
  batchNo: string
): Promise<BatchRelation | null> {
  // TODO: 从AIRIOT查询
  return null
}

/**
 * 根据工单号获取批次列表
 */
export async function getBatchesByWorkOrder(
  workOrderId: string
): Promise<BatchRelation[]> {
  // TODO: 从AIRIOT查询
  return []
}

/**
 * 根据订单号获取批次列表
 */
export async function getBatchesByOrder(
  orderId: string
): Promise<BatchRelation[]> {
  // TODO: 从AIRIOT查询
  return []
}

/**
 * 验证批次号格式
 */
export function validateBatchNumber(batchNo: string): boolean {
  // 批次号格式: B + 8位日期 + 4位订单后缀 + 3位流水号
  const pattern = /^B\d{8}\d{4}\d{3}$/
  return pattern.test(batchNo)
}

/**
 * 解析批次号
 */
export function parseBatchNumber(batchNo: string): {
  date: Date
  orderSuffix: string
  sequence: number
} | null {
  if (!validateBatchNumber(batchNo)) {
    return null
  }

  const dateStr = batchNo.substring(1, 9)
  const orderSuffix = batchNo.substring(9, 13)
  const sequence = parseInt(batchNo.substring(13, 16))

  const year = parseInt(dateStr.substring(0, 4))
  const month = parseInt(dateStr.substring(4, 6)) - 1
  const day = parseInt(dateStr.substring(6, 8))

  return {
    date: new Date(year, month, day),
    orderSuffix,
    sequence
  }
}
