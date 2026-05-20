// 质量检验服务 - 使用官方 @airiot/client SDK
import { createCatalogAPI } from '@/lib/airiot-client'
import { mockData } from '@/lib/mock-data'
import type { QualityCheck } from '@/types/quality'
import type { PageParams, PageResponse } from '@/types/api'
import { getToken } from '@/lib/auth-token'

/**
 * 获取检验记录列表
 */
export async function getQualityChecks(params: PageParams & {
  checkType?: string
  result?: string
  startDate?: string
  endDate?: string
}): Promise<PageResponse<QualityCheck>> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let data = [...mockData.qualityChecks]

        // 过滤
        if (params.checkType) {
          data = data.filter(item => item.checkType === params.checkType)
        }
        if (params.result) {
          data = data.filter(item => item.result === params.result)
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

    if (params.checkType) {
      wheres.push({
        field: 'checkType',
        operator: 'eq',
        value: params.checkType,
      })
    }
    if (params.result) {
      wheres.push({
        field: 'result',
        operator: 'eq',
        value: params.result,
      })
    }

    const { items, total } = await api.query(
      { tableId: 'quality_checks' },
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
    throw new Error(error.message || '获取检验记录列表失败')
  }
}

/**
 * 创建检验记录
 */
export async function createQualityCheck(data: Partial<QualityCheck>): Promise<QualityCheck> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return Promise.resolve({} as QualityCheck)
  }

  try {
    const api = createCatalogAPI()
    const result = await api.save({
      ...data,
      tableId: 'quality_checks',
    })
    return result as QualityCheck
  } catch (error: any) {
    throw new Error(error.message || '创建检验记录失败')
  }
}

/**
 * 获取检验记录详情
 */
export async function getQualityCheckDetail(id: string): Promise<QualityCheck> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    const check = mockData.qualityChecks.find(item => item.id === id)
    return Promise.resolve(check || {} as QualityCheck)
  }

  try {
    const api = createCatalogAPI()
    const result = await api.get(id, { tableId: 'quality_checks' })
    return result as QualityCheck
  } catch (error: any) {
    throw new Error(error.message || '获取检验记录详情失败')
  }
}

// ==================== 终检相关类型和接口 ====================

export interface FinalCheckTask {
  id: string
  woId: string
  workOrderNo: string
  productId: string
  productName: string
  processId: string
  processName: string
  batchNo: string
  quantity: number
  qualifiedQuantity: number
  unqualifiedQuantity: number
  inspectorId: string
  inspectorName: string
  checkTime: string
  status: 'pending' | 'checking' | 'passed' | 'failed' | 'rework' | 'scrapped'
  checkResult: 'pass' | 'fail' | 'partial_pass'
  defectLevel?: 'minor' | 'serious' | 'fatal'
  defectDescription?: string
  handlingMethod?: 'rework' | 'scrap' | 'special_accept'
  reworkOrderId?: string
  scrapQuantity?: number
  remarks?: string
  createdAt: string
  updatedAt: string
}

// Mock终检数据
const mockFinalCheckTasks: FinalCheckTask[] = [
  {
    id: 'FCT001',
    woId: 'WO25030001',
    workOrderNo: 'WO25030001',
    productId: 'PROD001',
    productName: '轴承座',
    processId: 'P001',
    processName: '精车',
    batchNo: 'B2025032701',
    quantity: 100,
    qualifiedQuantity: 95,
    unqualifiedQuantity: 5,
    inspectorId: 'INS001',
    inspectorName: '质检员A',
    checkTime: '2025-03-27 14:00:00',
    status: 'pending',
    checkResult: 'pass',
    createdAt: '2025-03-27',
    updatedAt: '2025-03-27',
  },
  {
    id: 'FCT002',
    woId: 'WO25030002',
    workOrderNo: 'WO25030002',
    productId: 'PROD002',
    productName: '齿轮',
    processId: 'P002',
    processName: '铣齿',
    batchNo: 'B2025032702',
    quantity: 50,
    qualifiedQuantity: 0,
    unqualifiedQuantity: 0,
    inspectorId: 'INS001',
    inspectorName: '质检员A',
    checkTime: '2025-03-27 15:00:00',
    status: 'pending',
    checkResult: 'pass',
    createdAt: '2025-03-27',
    updatedAt: '2025-03-27',
  },
  {
    id: 'FCT003',
    woId: 'WO25030003',
    workOrderNo: 'WO25030003',
    productId: 'PROD003',
    productName: '法兰盘',
    processId: 'P003',
    processName: '钻孔',
    batchNo: 'B2025032703',
    quantity: 80,
    qualifiedQuantity: 78,
    unqualifiedQuantity: 2,
    inspectorId: 'INS002',
    inspectorName: '质检员B',
    checkTime: '2025-03-27 16:00:00',
    status: 'checking',
    checkResult: 'partial_pass',
    defectLevel: 'minor',
    defectDescription: '孔径偏小0.1mm',
    handlingMethod: 'rework',
    createdAt: '2025-03-27',
    updatedAt: '2025-03-27',
  },
]

/**
 * 获取终检任务列表
 */
export async function getFinalCheckTasks(params: PageParams & {
  status?: string
  woId?: string
  startDate?: string
  endDate?: string
}): Promise<PageResponse<FinalCheckTask>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data = [...mockFinalCheckTasks]

      if (params.status) {
        data = data.filter(item => item.status === params.status)
      }
      if (params.woId) {
        data = data.filter(item => item.woId === params.woId)
      }

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
    }, 300)
  })
}

/**
 * 获取终检任务详情
 */
export async function getFinalCheckTaskDetail(id: string): Promise<FinalCheckTask | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const task = mockFinalCheckTasks.find(item => item.id === id)
      resolve(task || null)
    }, 300)
  })
}

/**
 * 创建终检记录
 */
export async function createFinalCheckTask(data: Partial<FinalCheckTask>): Promise<FinalCheckTask> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const task: FinalCheckTask = {
        id: `FCT${Date.now()}`,
        woId: data.woId || '',
        workOrderNo: data.workOrderNo || '',
        productId: data.productId || '',
        productName: data.productName || '',
        processId: data.processId || '',
        processName: data.processName || '',
        batchNo: data.batchNo || '',
        quantity: data.quantity || 0,
        qualifiedQuantity: data.qualifiedQuantity || 0,
        unqualifiedQuantity: data.unqualifiedQuantity || 0,
        inspectorId: data.inspectorId || '',
        inspectorName: data.inspectorName || '',
        checkTime: data.checkTime || new Date().toISOString(),
        status: 'pending',
        checkResult: data.checkResult || 'pass',
        defectLevel: data.defectLevel,
        defectDescription: data.defectDescription,
        handlingMethod: data.handlingMethod,
        reworkOrderId: data.reworkOrderId,
        scrapQuantity: data.scrapQuantity,
        remarks: data.remarks,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      }
      mockFinalCheckTasks.push(task)
      resolve(task)
    }, 300)
  })
}

/**
 * 提交终检结果
 */
export async function submitFinalCheckResult(id: string, data: {
  checkResult: 'pass' | 'fail' | 'partial_pass'
  qualifiedQuantity: number
  unqualifiedQuantity: number
  defectLevel?: 'minor' | 'serious' | 'fatal'
  defectDescription?: string
  handlingMethod?: 'rework' | 'scrap' | 'special_accept'
  reworkOrderId?: string
  scrapQuantity?: number
  remarks?: string
}): Promise<FinalCheckTask> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const task = mockFinalCheckTasks.find(item => item.id === id)
      if (task) {
        Object.assign(task, {
          ...data,
          status: data.checkResult === 'pass' ? 'passed' : 
                  data.checkResult === 'partial_pass' ? 'rework' : 'failed',
          updatedAt: new Date().toISOString().split('T')[0],
        })
        resolve(task)
      } else {
        resolve({} as FinalCheckTask)
      }
    }, 300)
  })
}

/**
 * 处理不合格品
 */
export async function handleUnqualifiedProduct(id: string, handlingMethod: 'rework' | 'scrap' | 'special_accept', data?: {
  reworkOrderId?: string
  scrapQuantity?: number
  remarks?: string
}): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const task = mockFinalCheckTasks.find(item => item.id === id)
      if (task) {
        task.handlingMethod = handlingMethod
        if (data?.reworkOrderId) task.reworkOrderId = data.reworkOrderId
        if (data?.scrapQuantity) task.scrapQuantity = data.scrapQuantity
        if (data?.remarks) task.remarks = data.remarks
        task.status = handlingMethod === 'scrap' ? 'scrapped' : 'rework'
        task.updatedAt = new Date().toISOString().split('T')[0]
        resolve(true)
      } else {
        resolve(false)
      }
    }, 300)
  })
}

// ==================== SPC统计数据接口 ====================

/**
 * 获取SPC统计数据
 */
export async function getSPCData(params: {
  woId?: string
  itemId?: string
  startDate?: string
  endDate?: string
}): Promise<any> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    // 返回Mock SPC数据
    return Promise.resolve({
      mean: 25.01,
      stdDev: 0.012,
      ucl: 25.05,
      lcl: 24.95,
      cp: 1.33,
      cpk: 1.28,
      samples: Array.from({ length: 50 }, () => 25 + (Math.random() - 0.5) * 0.1),
    })
  }

  // 真实API实现 - AIRIOT SPC数据查询
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
    const queryConditions: any = { limit: 100, skip: 0, withCount: true }
    if (params.woId) {
      queryConditions.wheres = queryConditions.wheres || []
      queryConditions.wheres.push({ field: 'woId', operator: 'eq', value: params.woId })
    }
    if (params.itemId) {
      queryConditions.wheres = queryConditions.wheres || []
      queryConditions.wheres.push({ field: 'itemId', operator: 'eq', value: params.itemId })
    }
    if (params.startDate) {
      queryConditions.wheres = queryConditions.wheres || []
      queryConditions.wheres.push({ field: 'checkTime', operator: 'gte', value: params.startDate })
    }
    if (params.endDate) {
      queryConditions.wheres = queryConditions.wheres || []
      queryConditions.wheres.push({ field: 'checkTime', operator: 'lte', value: params.endDate })
    }

    // 查询SPC数据
    const queryParam = JSON.stringify(queryConditions)
    const url = `${baseURL}/rest/core/t/${encodeURIComponent('SPC数据')}/d?query=${encodeURIComponent(queryParam)}`

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) throw new Error(`API请求失败: ${response.status}`)

    const result = await response.json()
    const items = Array.isArray(result) ? result : result.items || []

    // 计算SPC统计参数
    const values = items.map((item: any) => item.value || item.measureValue || 0)
    const mean = values.reduce((a: number, b: number) => a + b, 0) / values.length
    const stdDev = Math.sqrt(values.reduce((sq: number, n: number) => sq + Math.pow(n - mean, 2), 0) / values.length)
    const ucl = mean + 3 * stdDev
    const lcl = mean - 3 * stdDev
    const cpu = (ucl - mean) / (3 * stdDev)
    const cpl = (mean - lcl) / (3 * stdDev)
    const cp = (ucl - lcl) / (6 * stdDev)
    const cpk = Math.min(cpu, cpl)

    return {
      mean,
      stdDev,
      ucl,
      lcl,
      cp,
      cpk,
      samples: values,
    }
  } catch (error: any) {
    return {}
  }
}
