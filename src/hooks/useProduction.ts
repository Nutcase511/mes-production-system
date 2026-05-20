// 生产订单数据 Hook
import { useApiQuery } from './useApi'
import { getProductionOrders } from '@/services/production.service'
import { getToken } from '@/lib/auth-token'

export function useProductionOrders(params: {
  page?: number
  size?: number
  status?: string
  orderType?: string
  search?: string
} = {}) {
  return useApiQuery(
    (params) => getProductionOrders(params),
    params
  )
}

// 跟单数据 Hook
export function useWorkOrders(params: {
  page?: number
  size?: number
  status?: string
} = {}) {
  // 已实现真实API调用
  return useApiQuery(
    (params) => getWorkOrders(params),
    params
  )
}

// 获取跟单列表
async function getWorkOrders(params: {
  page?: number
  size?: number
  status?: string
}): Promise<{ list: any[]; total: number }> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    const { mockData } = await import('@/lib/mock-data')
    let data = [...mockData.workOrders]
    if (params.status) {
      data = data.filter(item => item.status === params.status)
    }
    const start = ((params.page || 1) - 1) * (params.size || 20)
    const end = start + (params.size || 20)
    return {
      list: data.slice(start, end),
      total: data.length,
    }
  }

  // 真实API实现 - AIRIOT跟单查询
  try {
    const isDev = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
    const baseURL = isDev ? '' : (import.meta.env.VITE_AIRIOT_API_URL || 'https://demo.airiot.link')

    const token = getToken()
    const projectId = import.meta.env.VITE_AIRIOT_PROJECT_ID || ''

    const getTimezoneOffset = () => {
      const offset = new Date().getTimezoneOffset()
      const absOffset = Math.abs(offset)
      const hours = String(Math.floor(absOffset / 60)).padStart(2, '0')
      const minutes = String(absOffset % 60).padStart(2, '0')
      return `${offset <= 0 ? '+' : '-'}${hours}:${minutes}`
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token,
      'x-request-project': projectId,
      'X-Request-TimeZone': getTimezoneOffset(),
    }

    // 构建查询条件
    const queryConditions: any = {
      skip: ((params.page || 1) - 1) * (params.size || 20),
      limit: params.size || 20,
      withCount: true,
    }
    if (params.status) {
      queryConditions.wheres = [{ field: 'status', operator: 'eq', value: params.status }]
    }

    const queryParam = JSON.stringify(queryConditions)
    const url = `${baseURL}/rest/core/t/${encodeURIComponent('生产跟单')}/d?query=${encodeURIComponent(queryParam)}`

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) throw new Error(`API请求失败: ${response.status}`)

    const result = await response.json()
    const items = Array.isArray(result) ? result : result.items || []

    return {
      list: items,
      total: result.total || items.length,
    }
  } catch (error: any) {
    // Silently handle work order query errors
    return { list: [], total: 0 }
  }
}
