/**
 * 动态排产服务
 * 已接入真实数据
 */

// import type { PageParams, PageResponse } from '@/types/api'
import type { PageResponse } from '@/types/api'
import type { ScheduleAlert, SchedulePlan, ScheduleStatus, AlertLevel } from '@/types/scheduling'
import { getToken } from '@/lib/auth-token'

// 周期状态选项
export const SCHEDULE_STATUS = [
  { value: '正常', label: '正常', color: '#52c41a' },
  { value: '预警', label: '预警', color: '#faad14' },
  { value: '超期', label: '超期', color: '#ff4d4f' },
  { value: '已调整', label: '已调整', color: '#1890ff' },
]

// 预警级别选项
export const ALERT_LEVEL = [
  { value: '低', label: '低', color: '#52c41a' },
  { value: '中', label: '中', color: '#faad14' },
  { value: '高', label: '高', color: '#ff4d4f' },
]

// ========== API 辅助函数 ==========

/** 获取时区偏移 */
const getTimezoneOffset = () => {
  const offset = (new Date()).getTimezoneOffset()
  const absOffset = Math.abs(offset)
  const hours = String(Math.floor(absOffset / 60)).padStart(2, '0')
  const minutes = String(absOffset % 60).padStart(2, '0')
  return `${offset <= 0 ? '+' : '-'}${hours}:${minutes}`
}

/** 获取请求头 */
const getHeaders = () => {
  const token = getToken()
  const projectId = import.meta.env.VITE_AIRIOT_PROJECT_ID || ''

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-TimeZone': getTimezoneOffset(),
  }

  if (token) headers['Authorization'] = `Bearer ${token}`
  if (projectId) headers['x-request-project'] = projectId

  return headers
}

/** 获取表的 Schema */
async function getTableSchema(tableId: string) {
  const isDev = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
  const baseURL = isDev ? '' : (import.meta.env.VITE_AIRIOT_API_URL || 'https://demo.airiot.link')

  const isUserTable = tableId.toLowerCase() === 'user'
  const url = isUserTable
    ? `${baseURL}/rest/core/user/schema`
    : `${baseURL}/rest/core/t/schema/${encodeURIComponent(tableId)}`

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  })

  if (!response.ok) {
    throw new Error(`获取Schema失败: ${response.status}`)
  }

  const schema = await response.json()

  return schema
}

/** 根据 Schema 构建 project 参数 */
function buildProjectFromSchema(schema: any): Record<string, number> {
  const project: Record<string, number> = {}

  if (schema?.schema?.properties) {
    Object.keys(schema.schema.properties).forEach(field => {
      project[field] = 1
    })
  }


  return project
}

/** 从表获取数据 */
async function fetchTableData(tableId: string, params: {
  skip?: number
  limit?: number
  wheres?: any[]
  withCount?: boolean
  project?: Record<string, number>
}) {
  const isDev = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
  const baseURL = isDev ? '' : (import.meta.env.VITE_AIRIOT_API_URL || 'https://demo.airiot.link')

  const query: Record<string, any> = {
    skip: params.skip || 0,
    limit: params.limit || 15,
    withCount: params.withCount !== false,
  }

  // 添加 project 参数（如果提供了）
  if (params.project && Object.keys(params.project).length > 0) {
    query.project = params.project
  }

  // 添加 wheres 参数（如果提供了）
  if (params.wheres && params.wheres.length > 0) {
    query.wheres = params.wheres
  }

  const queryString = encodeURIComponent(JSON.stringify(query))
  const isUserTable = tableId.toLowerCase() === 'user'
  const url = isUserTable
    ? `${baseURL}/rest/core/user?query=${queryString}`
    : `${baseURL}/rest/core/t/${encodeURIComponent(tableId)}/d?query=${queryString}`


  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return await response.json()
}

/** 更新记录 */
async function updateRecord(tableId: string, id: string, data: Record<string, any>) {
  const isDev = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
  const baseURL = isDev ? '' : (import.meta.env.VITE_AIRIOT_API_URL || 'https://demo.airiot.link')

  const isUserTable = tableId.toLowerCase() === 'user'
  const url = isUserTable
    ? `${baseURL}/rest/core/user/${id}`
    : `${baseURL}/rest/core/t/${encodeURIComponent(tableId)}/d/${id}`

  const response = await fetch(url, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return await response.json()
}

// ========== 数据转换和计算函数 ==========

/**
 * 计算预警级别
 */
function calculateAlertLevel(remainingDays: number, completedRate: number): AlertLevel {
  if (remainingDays < 0) return '高'
  if (remainingDays <= 3 && completedRate < 80) return '高'
  if (remainingDays <= 7 && completedRate < 60) return '中'
  if (remainingDays <= 5) return '中'
  return '低'
}

/**
 * 计算订单状态
 */
function calculateStatus(remainingDays: number, completedRate: number): ScheduleStatus {
  if (remainingDays < 0) return '超期'
  if (remainingDays <= 3 && completedRate < 80) return '超期'
  if (remainingDays <= 7 && completedRate < 60) return '预警'
  if (remainingDays <= 5) return '预警'
  return '正常'
}

/**
 * 生成建议操作
 */
function generateSuggestedAction(alertLevel: AlertLevel, status: ScheduleStatus, completedRate: number): string {
  if (status === '超期') {
    if (completedRate < 50) {
      return '紧急调配资源，考虑外协部分工序'
    } else {
      return '启动加班机制，协调检验人员提前到位'
    }
  }
  if (status === '预警') {
    if (alertLevel === '高') {
      return '增加班次，加快关键工序进度'
    } else {
      return '优化排产，优先安排瓶颈工序'
    }
  }
  return '按计划执行'
}

/**
 * 将生产订单数据转换为预警数据
 */
function transformToAlert(order: any): ScheduleAlert {

  // 按照 schema 的驼峰命名映射
  const notificationNumber = order.notificationNumber || ''
  const plannedDeliveryDate = order.plannedDeliveryDate || ''
  // 以下字段保留以备后用
  // const _customerName = order.customerName || ''
  // const _completedQuantity = 0
  const customerOrderNo = order.customerOrderNo || ''

  // 计算完成率（暂时使用默认值，等有对应字段后再更新）
  // const _completedQuantity = 0
  const planQuantity = 1
  const completedRate = 0

  // 计算剩余天数
  const today = new Date()
  const delivery = plannedDeliveryDate ? new Date(plannedDeliveryDate) : new Date()
  const remainingDays = Math.ceil((delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  const alertLevel = calculateAlertLevel(remainingDays, completedRate)
  const status = calculateStatus(remainingDays, completedRate)
  const suggestedAction = generateSuggestedAction(alertLevel, status, completedRate)

  return {
    id: order.id || '',
    orderNo: notificationNumber, // 订单号 = 通知单编号
    productName: customerOrderNo, // 产品名称 = 客户订单号
    quantity: planQuantity,
    deliveryDate: plannedDeliveryDate,
    remainingDays,
    completedRate,
    status,
    alertLevel,
    suggestedAction,
    _createTime: order._createTime || new Date().toISOString(),
  }
}

/**
 * 将生产计划数据转换为排产计划数据
 */
function transformToPlan(plan: any): SchedulePlan {

  // 根据schema字段映射（kebab-case格式）
  const transformed = {
    id: plan.id || plan['serial-number'] || '',
    orderNo: plan['order-no'] || plan.orderNo || plan['dispatch-no'] || '',
    productName: plan['product-name'] || plan.productName || plan['product'] || '',
    processName: plan['process-name'] || plan.processName || plan['process'] || '',
    equipmentName: plan['equipment-name'] || plan.equipmentName || plan['equipment'] || '',
    plannedStart: plan['planned-start'] || plan.plannedStart || '',
    plannedEnd: plan['planned-end'] || plan.plannedEnd || '',
    actualStart: plan['actual-start'] || plan.actualStart || '',
    actualEnd: plan['actual-end'] || plan.actualEnd || '',
    status: plan.status || '未开始',
    _createTime: plan._createTime || new Date().toISOString(),
  }


  return transformed
}

/**
 * 获取周期预警列表（从投产通知单表）
 */
export async function getScheduleAlerts(params?: {
  page?: number
  size?: number
  status?: string
  alertLevel?: string
  search?: string
}): Promise<PageResponse<ScheduleAlert>> {
  const { page = 1, size = 15, status, alertLevel, search } = params || {}

  try {
    // 先获取 Schema
    const schema = await getTableSchema('投产通知单')

    // 根据 Schema 构建 project 参数（包含所有字段）
    const project = buildProjectFromSchema(schema)

    // 从投产通知单表获取数据
    const result = await fetchTableData('投产通知单', {
      skip: 0,
      limit: 1000,
      withCount: true,
      project,
    })


    // AIRIOT API 可能直接返回数组，也可能包装在对象中
    let rawData: any[] = []

    if (Array.isArray(result)) {
      rawData = result
    } else if (result.items && Array.isArray(result.items)) {
      rawData = result.items
    } else if (result.data && Array.isArray(result.data)) {
      rawData = result.data
    }

    if (rawData.length > 0) {
    }

    // 转换为预警数据
    let alerts = rawData.map(transformToAlert)

    if (alerts.length > 0) {
    }

    // 前端筛选
    if (status && status !== 'all') {
      alerts = alerts.filter((item: ScheduleAlert) => item.status === status)
    }
    if (alertLevel && alertLevel !== 'all') {
      alerts = alerts.filter((item: ScheduleAlert) => item.alertLevel === alertLevel)
    }
    if (search) {
      const s = search.toLowerCase()
      alerts = alerts.filter((item: ScheduleAlert) =>
        item.orderNo.toLowerCase().includes(s) ||
        item.productName.toLowerCase().includes(s)
      )
    }

    const total = alerts.length
    const startIndex = (page - 1) * size
    const list = alerts.slice(startIndex, startIndex + size)

    return {
      list,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    }
  } catch (error: any) {
    throw new Error(error.message || '获取预警数据失败')
  }
}

/**
 * 获取排产计划列表（从生产计划表）
 */
export async function getSchedulePlans(params?: {
  page?: number
  size?: number
  search?: string
}): Promise<PageResponse<SchedulePlan>> {
  const { page = 1, size = 15, search } = params || {}

  try {
    // 先获取 Schema
    const schema = await getTableSchema('生产计划')

    if (schema?.schema?.properties) {
      Object.keys(schema.schema.properties).forEach(field => {
        const fieldConfig = schema.schema.properties[field]
      })
    }

    // 根据 Schema 构建 project 参数（包含所有字段）
    const project = buildProjectFromSchema(schema)

    // 从生产计划表获取数据
    const result = await fetchTableData('生产计划', {
      skip: (page - 1) * size,
      limit: size,
      withCount: true,
      project,
    })


    // AIRIOT API 可能直接返回数组，也可能包装在对象中
    let rawData: any[] = []

    if (Array.isArray(result)) {
      rawData = result
    } else if (result.items && Array.isArray(result.items)) {
      rawData = result.items
    } else if (result.data && Array.isArray(result.data)) {
      rawData = result.data
    }

    if (rawData.length > 0) {
    }

    // 转换为排产计划数据
    let plans = rawData.map(transformToPlan)


    // 前端搜索
    if (search) {
      const s = search.toLowerCase()
      plans = plans.filter((item: SchedulePlan) =>
        item.orderNo.toLowerCase().includes(s) ||
        item.productName.toLowerCase().includes(s)
      )
    }

    const total = plans.length
    const startIndex = (page - 1) * size
    const list = plans.slice(startIndex, startIndex + size)

    return {
      list,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    }
  } catch (error: any) {
    throw new Error(error.message || '获取排产计划失败')
  }
}

/**
 * 重排产
 */
export async function reschedule(orderNo: string, newPlan: { plannedStart: string; plannedEnd: string; remark: string }): Promise<boolean> {
  try {
    // 定义需要返回的字段（只需要ID）
    const project = {
      'serial-number': 1,
      'notification-number': 1,
    }

    // 使用 wheres 参数查找订单记录
    const result = await fetchTableData('投产通知单', {
      wheres: [{
        field: 'notification-number',
        operator: 'eq',
        value: orderNo,
      }],
      limit: 1,
      project,
    })

    const record = (result.items || result.data || [])?.[0]
    if (!record) {
      throw new Error('未找到对应的订单记录')
    }

    // 更新计划时间
    await updateRecord('投产通知单', record.id, {
      'planned-start': newPlan.plannedStart,
      'planned-end': newPlan.plannedEnd,
      'adjustment-remark': newPlan.remark,
      'adjustment-time': new Date().toISOString(),
    })

    return true
  } catch (error: any) {
    throw new Error(error.message || '重排产失败')
  }
}

/**
 * 获取状态颜色
 */
export function getScheduleStatusColor(status?: ScheduleStatus): string {
  const item = SCHEDULE_STATUS.find(s => s.value === status)
  return item?.color || '#999'
}

/**
 * 获取预警级别颜色
 */
export function getAlertLevelColor(level?: AlertLevel): string {
  const item = ALERT_LEVEL.find(s => s.value === level)
  return item?.color || '#999'
}
