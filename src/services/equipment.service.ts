// 设备服务 - 使用官方 @airiot/client SDK
import { createCatalogAPI } from '@/lib/airiot-client'
import { mockData } from '@/lib/mock-data'
import type { Equipment } from '@/types/equipment'
import type { PageParams, PageResponse } from '@/types/api'
import { getToken } from '@/lib/auth-token'

/**
 * 获取设备列表
 */
export async function getEquipments(params: PageParams & {
  status?: string
  equipmentType?: string
}): Promise<PageResponse<Equipment>> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let data = [...mockData.equipments]

        // 过滤
        if (params.status) {
          data = data.filter(item => item.status === params.status)
        }
        if (params.equipmentType) {
          data = data.filter(item => item.equipmentType === params.equipmentType)
        }

        resolve({
          list: data,
          total: data.length,
          page: params.page,
          size: params.size,
          totalPages: Math.ceil(data.length / params.size),
        })
      }, 500)
    })
  }

  // 真实API - 使用 @airiot/client SDK
  try {
    const api = createCatalogAPI()

    // 构建查询过滤条件
    const wheres: any[] = []

    if (params.status) {
      wheres.push({
        field: 'status',
        operator: 'eq',
        value: params.status,
      })
    }
    if (params.equipmentType) {
      wheres.push({
        field: 'equipmentType',
        operator: 'eq',
        value: params.equipmentType,
      })
    }

    const { items, total } = await api.query(
      { tableId: 'equipments' },
      wheres,
      true,
      {
        skip: (params.page - 1) * params.size,
        limit: params.size,
      }
    )

    return {
      list: items || [],
      total: total || 0,
      page: params.page,
      size: params.size,
      totalPages: Math.ceil((total || 0) / params.size),
    }
  } catch (error: any) {
    throw new Error(error.message || '获取设备列表失败')
  }
}

/**
 * 获取设备详情
 */
export async function getEquipmentDetail(id: string): Promise<Equipment> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    const equipment = mockData.equipments.find(item => item.id === id)
    return Promise.resolve(equipment || {} as Equipment)
  }

  try {
    const api = createCatalogAPI()
    const result = await api.get(id, { tableId: 'equipments' })
    return result as Equipment
  } catch (error: any) {
    throw new Error(error.message || '获取设备详情失败')
  }
}

/**
 * 获取设备实时状态
 */
export async function getEquipmentStatus(equipmentId: string): Promise<{
  status: string
  oee?: number
  currentWorkOrder?: string
  currentOperator?: string
  runtime?: number
  lastMaintenance?: string
}> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    const equipment = mockData.equipments.find(item => item.equipmentId === equipmentId)
    return Promise.resolve({
      status: equipment?.status || '空闲',
      oee: equipment?.oee,
      currentWorkOrder: equipment?.currentWorkOrder,
      currentOperator: equipment?.currentOperator,
      runtime: Math.floor(Math.random() * 10000),
      lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
  }

  // 真实API实现 - AIRIOT设备状态查询
  try {
    const isDev = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
    const baseURL = isDev ? '' : (import.meta.env.VITE_AIRIOT_API_URL || 'https://demo.airiot.link')
    const url = `${baseURL}/rest/core/t/${encodeURIComponent('设备状态')}/d?query=${encodeURIComponent(JSON.stringify({ limit: 1, skip: 0 }))}`

    const token = getToken()
    const projectId = import.meta.env.VITE_AIRIOT_PROJECT_ID || ''

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'x-request-project': projectId,
        'X-Request-TimeZone': getTimezoneOffset(),
      },
    })

    if (!response.ok) throw new Error(`API请求失败: ${response.status}`)

    const result = await response.json()
    const item = Array.isArray(result) ? result[0] : result.items?.[0]

    return {
      status: item?.status || '空闲',
      oee: item?.oee,
      currentWorkOrder: item?.currentWorkOrder,
      currentOperator: item?.currentOperator,
      runtime: item?.runtime,
      lastMaintenance: item?.lastMaintenance,
    }
  } catch (error: any) {
    return { status: '未知' }
  }
}

/**
 * 获取设备统计数据
 */
export async function getEquipmentStats(): Promise<{
  total: number
  running: number
  idle: number
  fault: number
  maintenance: number
  averageOEE: number
}> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return Promise.resolve({
      total: 20,
      running: 12,
      idle: 3,
      fault: 2,
      maintenance: 3,
      averageOEE: 82.5,
    })
  }

  // 真实API实现 - AIRIOT设备统计查询
  try {
    const isDev = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
    const baseURL = isDev ? '' : (import.meta.env.VITE_AIRIOT_API_URL || 'https://demo.airiot.link')
    const url = `${baseURL}/rest/core/t/${encodeURIComponent('设备')}/d?query=${encodeURIComponent(JSON.stringify({ limit: 1000, skip: 0, withCount: true }))}`

    const token = getToken()
    const projectId = import.meta.env.VITE_AIRIOT_PROJECT_ID || ''

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'x-request-project': projectId,
        'X-Request-TimeZone': getTimezoneOffset(),
      },
    })

    if (!response.ok) throw new Error(`API请求失败: ${response.status}`)

    const result = await response.json()
    const items = Array.isArray(result) ? result : result.items || []

    const running = items.filter((item: any) => item.status === '运行中').length
    const idle = items.filter((item: any) => item.status === '空闲').length
    const fault = items.filter((item: any) => item.status === '故障').length
    const maintenance = items.filter((item: any) => item.status === '保养').length
    const oeeValues = items.filter((item: any) => item.oee).map((item: any) => item.oee)
    const averageOEE = oeeValues.length > 0 ? oeeValues.reduce((a: number, b: number) => a + b, 0) / oeeValues.length : 0

    return {
      total: items.length,
      running,
      idle,
      fault,
      maintenance,
      averageOEE,
    }
  } catch (error: any) {
    return {
      total: 0,
      running: 0,
      idle: 0,
      fault: 0,
      maintenance: 0,
      averageOEE: 0,
    }
  }
}

// 辅助函数：获取时区偏移
function getTimezoneOffset(): string {
  const offset = new Date().getTimezoneOffset()
  const absOffset = Math.abs(offset)
  const hours = String(Math.floor(absOffset / 60)).padStart(2, '0')
  const minutes = String(absOffset % 60).padStart(2, '0')
  return `${offset <= 0 ? '+' : '-'}${hours}:${minutes}`
}
