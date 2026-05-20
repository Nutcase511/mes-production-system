/**
 * 外协管理服务
 */

import { getToken } from '@/lib/auth-token'

const getBaseURL = () => {
  const isDev = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
  return isDev ? '' : (import.meta.env.VITE_AIRIOT_API_URL || 'https://demo.airiot.link')
}

const getHeaders = () => {
  const token = getToken()
  const projectId = import.meta.env.VITE_AIRIOT_PROJECT_ID || ''

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) headers['Authorization'] = token
  if (projectId) headers['x-request-project'] = projectId

  return headers
}

// 外协单类型
export interface OutsourcingOrder {
  id: string
  'serial-number'?: string  // 外协单编号
  'text-xxx'?: string      // 外协产品名称
  'text-yyy'?: string       // 外协单位
  'select-type'?: string   // 外协类型（全工序/产能不足/工序部分/临时作业）
  'select-status'?: string  // 状态（待下发/进行中/待验收/已完成）
  'date-start'?: string     // 下发日期
  'date-end'?: string       // 预计完成日期
  'text-remark'?: string    // 备注
  'number-quantity'?: number // 外协数量
  [key: string]: any
}

// 外协类型选项
export const OUTSOURCING_TYPES = [
  { value: 'full', label: '全工序外协' },
  { value: 'capacity', label: '产能不足外协' },
  { value: 'partial', label: '工序部分外协' },
  { value: 'temp', label: '临时作业外协' },
]

// 外协状态选项
export const OUTSOURCING_STATUS = [
  { value: 'pending', label: '待下发', color: '#faad14' },
  { value: 'processing', label: '进行中', color: '#1890ff' },
  { value: 'pending_check', label: '待验收', color: '#722ed1' },
  { value: 'completed', label: '已完成', color: '#52c41a' },
]

// 获取外协单列表
export async function getOutsourcingOrders(params?: {
  page?: number
  size?: number
  status?: string
  search?: string
}): Promise<{
  list: OutsourcingOrder[]
  page: number
  size: number
  total: number
  totalPages: number
}> {
  const { page = 1, size = 15, status, search } = params || {}

  try {
    // 尝试从 AIRIOT 获取数据
    const baseURL = getBaseURL()
    const query: any = {
      skip: (page - 1) * size,
      limit: size,
    }

    // 添加状态筛选
    if (status && status !== 'all') {
      query['select-status'] = status
    }

    // 添加搜索条件（如果有 serial-number 或 text-xxx 字段）
    if (search) {
      query.$or = [
        { 'serial-number': { $regex: search } },
        { 'text-xxx': { $regex: search } },
        { 'text-yyy': { $regex: search } },
      ]
    }

    const queryString = encodeURIComponent(JSON.stringify(query))
    const url = `${baseURL}/rest/core/t/外协单/d?query=${queryString}`


    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`获取外协单列表失败: ${response.status}`)
    }

    const result = await response.json()
    const items = result.items || result.data || result || []
    const total = result.total || items.length

    return {
      list: items,
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
    }
  } catch (error: any) {
    // 如果 API 调用失败，返回模拟数据
    return getMockOutsourcingOrders(page, size, status, search)
  }
}

// 创建外协单
export async function createOutsourcingOrder(data: Partial<OutsourcingOrder>): Promise<OutsourcingOrder> {
  try {
    const baseURL = getBaseURL()
    const url = `${baseURL}/rest/core/t/外协单/d`

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`创建外协单失败: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error: any) {
    throw error
  }
}

// 更新外协单
export async function updateOutsourcingOrder(id: string, data: Partial<OutsourcingOrder>): Promise<OutsourcingOrder> {
  try {
    const baseURL = getBaseURL()
    const url = `${baseURL}/rest/core/t/外协单/d/${id}`

    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`更新外协单失败: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error: any) {
    throw error
  }
}

// 获取外协单详情
export async function getOutsourcingOrderById(id: string): Promise<OutsourcingOrder | null> {
  try {
    const baseURL = getBaseURL()
    const url = `${baseURL}/rest/core/t/外协单/d/${id}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`获取外协单详情失败: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error: any) {
    return null
  }
}

// 删除外协单
export async function deleteOutsourcingOrder(id: string): Promise<boolean> {
  try {
    const baseURL = getBaseURL()
    const url = `${baseURL}/rest/core/t/外协单/d/${id}`

    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
    })

    return response.ok
  } catch (error: any) {
    return false
  }
}

// 模拟数据
function getMockOutsourcingOrders(
  page: number = 1,
  size: number = 15,
  status?: string,
  search?: string
): {
  list: OutsourcingOrder[]
  page: number
  size: number
  total: number
  totalPages: number
} {
  const mockData: OutsourcingOrder[] = [
    {
      id: 'os001',
      'serial-number': 'OS20240001',
      'text-xxx': '精密齿轮组件',
      'text-yyy': '上海精密机械厂',
      'select-type': 'full',
      'select-status': 'completed',
      'date-start': '2024-01-15',
      'date-end': '2024-02-15',
      'number-quantity': 500,
      'text-remark': '首批外协订单',
    },
    {
      id: 'os002',
      'serial-number': 'OS20240002',
      'text-xxx': '铝合金外壳',
      'text-yyy': '苏州五金制品厂',
      'select-type': 'partial',
      'select-status': 'processing',
      'date-start': '2024-02-01',
      'date-end': '2024-02-28',
      'number-quantity': 200,
      'text-remark': '阳极氧化工序外协',
    },
    {
      id: 'os003',
      'serial-number': 'OS20240003',
      'text-xxx': '不锈钢阀门',
      'text-yyy': '浙江阀门有限公司',
      'select-type': 'capacity',
      'select-status': 'pending_check',
      'date-start': '2024-01-20',
      'date-end': '2024-02-10',
      'number-quantity': 150,
      'text-remark': '产能不足，紧急外协',
    },
    {
      id: 'os004',
      'serial-number': 'OS20240004',
      'text-xxx': 'PCB线路板',
      'text-yyy': '深圳电子科技',
      'select-type': 'full',
      'select-status': 'pending',
      'date-start': '2024-02-20',
      'date-end': '2024-03-20',
      'number-quantity': 300,
      'text-remark': '特殊调度，委托专业厂商',
    },
    {
      id: 'os005',
      'serial-number': 'OS20240005',
      'text-xxx': '液压缸体',
      'text-yyy': '无锡液压设备厂',
      'select-type': 'temp',
      'select-status': 'processing',
      'date-start': '2024-02-10',
      'date-end': '2024-02-25',
      'number-quantity': 80,
      'text-remark': '临时加急订单',
    },
    {
      id: 'os006',
      'serial-number': 'OS20240006',
      'text-xxx': '减速机齿轮',
      'text-yyy': '南京机械制造厂',
      'select-type': 'partial',
      'select-status': 'completed',
      'date-start': '2024-01-05',
      'date-end': '2024-01-25',
      'number-quantity': 120,
      'text-remark': '热处理工序外协',
    },
  ]

  let filteredData = [...mockData]

  // 状态筛选
  if (status && status !== 'all') {
    filteredData = filteredData.filter(item => item['select-status'] === status)
  }

  // 搜索筛选
  if (search) {
    const searchLower = search.toLowerCase()
    filteredData = filteredData.filter(item =>
      item['serial-number']?.toLowerCase().includes(searchLower) ||
      item['text-xxx']?.toLowerCase().includes(searchLower) ||
      item['text-yyy']?.toLowerCase().includes(searchLower)
    )
  }

  const total = filteredData.length
  const startIndex = (page - 1) * size
  const endIndex = startIndex + size
  const list = filteredData.slice(startIndex, endIndex)

  return {
    list,
    page,
    size,
    total,
    totalPages: Math.ceil(total / size),
  }
}

// 获取状态颜色
export function getStatusColor(status?: string): string {
  const statusItem = OUTSOURCING_STATUS.find(s => s.value === status)
  return statusItem?.color || '#999'
}

// 获取状态标签
export function getStatusLabel(status?: string): string {
  const statusItem = OUTSOURCING_STATUS.find(s => s.value === status)
  return statusItem?.label || status || '未知'
}

// 获取类型标签
export function getTypeLabel(type?: string): string {
  const typeItem = OUTSOURCING_TYPES.find(t => t.value === type)
  return typeItem?.label || type || '未知'
}
