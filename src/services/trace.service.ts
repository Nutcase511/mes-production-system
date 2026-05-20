/**
 * 质量追溯服务
 * 构建完整的生产追溯链
 */

export interface TraceChainItem {
  /** 类型 */
  type: 'order' | 'workOrder' | 'report' | 'inspection' | 'material' | 'inbound'
  /** ID */
  id: string
  /** 编号 */
  no: string
  /** 名称 */
  name?: string
  /** 时间 */
  time: Date
  /** 操作人 */
  operator?: string
  /** 数量 */
  quantity?: number
  /** 详情 */
  details?: any
}

export interface TraceChain {
  /** 批次号 */
  batchNo: string
  /** 订单编号 */
  orderNo: string
  /** 工单编号 */
  workOrderNo: string
  /** 产品名称 */
  productName: string
  /** 数量 */
  quantity: number
  /** 追溯链 */
  chain: TraceChainItem[]
}

/**
 * 构建完整追溯链
 */
export async function buildTraceChain(workOrderId: string): Promise<TraceChainItem[]> {
  const chain: TraceChainItem[] = []

  // 1. 获取工单信息
  const workOrder = await getWorkOrderInfo(workOrderId)
  if (workOrder) {
    chain.push({
      type: 'workOrder',
      id: workOrder.id,
      no: workOrder.woId,
      name: '生产跟单',
      time: workOrder.createTime,
      operator: workOrder.creator,
      quantity: workOrder.inputQty,
      details: workOrder
    })
  }

  // 2. 获取报工记录
  const reports = await getWorkReports(workOrderId)
  reports.forEach(report => {
    chain.push({
      type: 'report',
      id: report.id,
      no: report.reportNo,
      name: report.processName,
      time: report.reportTime,
      operator: report.operator,
      quantity: report.qualifiedQty,
      details: report
    })
  })

  // 3. 获取质检记录
  const inspections = await getInspections(workOrderId)
  inspections.forEach(inspection => {
    chain.push({
      type: 'inspection',
      id: inspection.id,
      no: inspection.inspectionNo,
      name: getInspectionTypeName(inspection.type),
      time: inspection.inspectionTime,
      operator: inspection.inspector,
      details: inspection
    })
  })

  // 4. 获取物料批次记录
  const materials = await getMaterialBatches(workOrderId)
  materials.forEach(material => {
    chain.push({
      type: 'material',
      id: material.id,
      no: material.batchNo,
      name: material.materialName,
      time: material.useTime,
      quantity: material.quantity,
      details: material
    })
  })

  // 5. 获取入库记录
  const inbounds = await getInbounds(workOrderId)
  inbounds.forEach(inbound => {
    chain.push({
      type: 'inbound',
      id: inbound.id,
      no: inbound.inboundNo,
      name: '成品入库',
      time: inbound.inboundTime,
      operator: inbound.inboundOperator,
      quantity: inbound.quantity,
      details: inbound
    })
  })

  // 按时间排序
  chain.sort((a, b) => a.time.getTime() - b.time.getTime())

  return chain
}

/**
 * 根据批次号获取完整追溯信息
 */
export async function getTraceByBatchNo(batchNo: string): Promise<TraceChain | null> {
  // 1. 获取批次关联信息
  const batchRelation = await getBatchRelation(batchNo)
  if (!batchRelation) {
    return null
  }

  // 2. 构建追溯链
  const chain = await buildTraceChain(batchRelation.workOrderId)

  // 3. 获取产品信息
  const workOrder = await getWorkOrderInfo(batchRelation.workOrderId)

  return {
    batchNo,
    orderNo: batchRelation.orderNo,
    workOrderNo: batchRelation.workOrderNo,
    productName: workOrder?.productName || '未知产品',
    quantity: batchRelation.quantity,
    chain
  }
}

/**
 * 验证批次号格式
 */
export function validateBatchNumber(batchNo: string): boolean {
  // 批次号格式：B + 年月日(8位) + 订单号后4位 + 流水号3位
  // 示例：B20240301001A001
  const pattern = /^B\d{8}.{4}\d{3}$/
  return pattern.test(batchNo)
}

/**
 * 获取质检类型名称
 */
function getInspectionTypeName(type: string): string {
  const typeNames: Record<string, string> = {
    'first': '首件检验',
    'patrol': '巡检',
    'final': '终检'
  }
  return typeNames[type] || type
}

// 以下为模拟函数，实际需要从AIRIOT获取数据

async function getWorkOrderInfo(workOrderId: string) {
  // TODO: 从AIRIOT查询
  return null
}

async function getWorkReports(workOrderId: string) {
  // TODO: 从AIRIOT查询
  return []
}

async function getInspections(workOrderId: string) {
  // TODO: 从AIRIOT查询
  return []
}

async function getMaterialBatches(workOrderId: string) {
  // TODO: 从AIRIOT查询
  return []
}

async function getInbounds(workOrderId: string) {
  // TODO: 从AIRIOT查询
  return []
}

async function getBatchRelation(batchNo: string) {
  // TODO: 从AIRIOT查询
  return null
}
