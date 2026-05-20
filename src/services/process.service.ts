// 调度路线服务 - 使用官方 @airiot/client SDK
import { createCatalogAPI } from '@/lib/airiot-client'
import { mockData } from '@/lib/mock-data'
import type { ProcessRoute } from '@/types/process'
import type { PageParams, PageResponse } from '@/types/api'
import { getToken } from '@/lib/auth-token'

/**
 * 获取调度路线列表
 */
export async function getProcessRoutes(params: PageParams & {
  productCode?: string
  status?: string
}): Promise<PageResponse<ProcessRoute>> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let data = [...mockData.processRoutes]

        // 过滤
        if (params.productCode) {
          data = data.filter(item => item.productCode === params.productCode)
        }
        if (params.status) {
          data = data.filter(item => item.status === params.status)
        }

        // 分页
        const start = (params.page - 1) * params.size
        const end = start + params.size
        const pageData = data.slice(start, end)

        resolve({
          list: pageData,
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

    if (params.productCode) {
      wheres.push({
        field: 'productCode',
        operator: 'eq',
        value: params.productCode,
      })
    }
    if (params.status) {
      wheres.push({
        field: 'status',
        operator: 'eq',
        value: params.status,
      })
    }

    const { items, total } = await api.query(
      { tableId: 'process_routes' },
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
    throw new Error(error.message || '获取调度路线列表失败')
  }
}

/**
 * 获取调度路线详情
 */
export async function getProcessRouteDetail(id: string): Promise<ProcessRoute> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    const route = mockData.processRoutes.find(item => item.id === id)
    return Promise.resolve(route || {} as ProcessRoute)
  }

  try {
    const api = createCatalogAPI()
    const result = await api.get(id, { tableId: 'process_routes' })
    return result as ProcessRoute
  } catch (error: any) {
    throw new Error(error.message || '获取调度路线详情失败')
  }
}

/**
 * 调度路线匹配
 */
export async function matchProcessRoute(params: {
  productCode: string
  quantity: number
}): Promise<{
  routes: Array<{
    route: ProcessRoute
    matchScore: number
    matchReasons: string[]
  }>
}> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const matchedRoutes = mockData.processRoutes
          .filter(route => route.productCode === params.productCode)
          .slice(0, 3)
          .map(route => ({
            route,
            matchScore: 0.7 + Math.random() * 0.3,
            matchReasons: [
              '产品编码匹配',
              '调度适用',
              '产能满足',
            ],
          }))

        resolve({
          routes: matchedRoutes,
        })
      }, 500)
    })
  }

  // 真实API实现 - AIRIOT调度匹配算法
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

    // 查询匹配的调度路线
    const queryParam = JSON.stringify({
      limit: 100,
      skip: 0,
      withCount: true,
      wheres: [
        { field: 'productCode', operator: 'eq', value: params.productCode }
      ]
    })
    const url = `${baseURL}/rest/core/t/${encodeURIComponent('调度路线')}/d?query=${encodeURIComponent(queryParam)}`

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) throw new Error(`API请求失败: ${response.status}`)

    const result = await response.json()
    const items = Array.isArray(result) ? result : result.items || []

    // 计算匹配度
    const matchedRoutes = items.map((item: any) => {
      let score = 0.5
      const reasons: string[] = []

      // 产品编码匹配
      if (item.productCode === params.productCode) {
        score += 0.3
        reasons.push('产品编码匹配')
      }

      // 产能满足
      if (item.capacity && item.capacity >= params.quantity) {
        score += 0.1
        reasons.push('产能满足')
      }

      // 设备空闲
      if (item.status === 'active') {
        score += 0.1
        reasons.push('路线可用')
      }

      return {
        route: item as ProcessRoute,
        matchScore: Math.min(score, 1),
        matchReasons: reasons,
      }
    }).sort((a: any, b: any) => b.matchScore - a.matchScore)

    return { routes: matchedRoutes }
  } catch (error: any) {
    return { routes: [] }
  }
}

/**
 * 创建调度路线
 */
export async function createProcessRoute(data: Partial<ProcessRoute>): Promise<ProcessRoute> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return Promise.resolve({} as ProcessRoute)
  }

  try {
    const api = createCatalogAPI()
    const result = await api.save({
      ...data,
      tableId: 'process_routes',
    })
    return result as ProcessRoute
  } catch (error: any) {
    throw new Error(error.message || '创建调度路线失败')
  }
}

/**
 * 更新调度路线
 */
export async function updateProcessRoute(id: string, data: Partial<ProcessRoute>): Promise<void> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return Promise.resolve()
  }

  try {
    const api = createCatalogAPI()
    await api.save({
      ...data,
      id,
      tableId: 'process_routes',
    }, true)  // partial=true 表示更新
  } catch (error: any) {
    throw new Error(error.message || '更新调度路线失败')
  }
}
