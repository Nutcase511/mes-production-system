// 工时管理服务
import type {
  WorkTimeQuota,
  WorkTimeRecord,
  WorkTimeVerification,
  WorkTimeStats,
  WorkerTimeStats,
  EquipmentTimeStats,
  DailyTimeStats
} from '@/types/worktime'
import type { PageParams, PageResponse } from '@/types/api'
import { getToken } from '@/lib/auth-token'

// 模拟数据
const mockQuotas: WorkTimeQuota[] = [
  { id: '1', productId: 'P001', productName: '产品A', processId: 'PROC001', processName: '车削', quotaHours: 2.5, unit: '件', effectiveDate: '2025-01-01', status: '启用' },
  { id: '2', productId: 'P001', productName: '产品A', processId: 'PROC002', processName: '铣削', quotaHours: 1.5, unit: '件', effectiveDate: '2025-01-01', status: '启用' },
  { id: '3', productId: 'P002', productName: '产品B', processId: 'PROC001', processName: '车削', quotaHours: 3.0, unit: '件', effectiveDate: '2025-01-01', status: '启用' },
  { id: '4', productId: 'P003', productName: '产品C', processId: 'PROC003', processName: '磨削', quotaHours: 1.0, unit: '件', effectiveDate: '2025-02-01', status: '启用' },
]

const mockRecords: WorkTimeRecord[] = [
  { id: '1', recordId: 'WT20250327001', workOrderId: 'WO25030001', workOrderNo: 'WO-2025-03001', productId: 'P001', productName: '产品A', processId: 'PROC001', processName: '车削', workerId: 'W001', workerName: '张三', equipmentId: 'EQ001', equipmentName: '车床01', workDate: '2025-03-27', startTime: '08:00', endTime: '12:00', workHours: 4, workTimeType: '正常工时', outputQuantity: 10, qualifiedQuantity: 10, status: '待核销', createdAt: '2025-03-27 12:00:00' },
  { id: '2', recordId: 'WT20250327002', workOrderId: 'WO25030001', workOrderNo: 'WO-2025-03001', productId: 'P001', productName: '产品A', processId: 'PROC001', processName: '车削', workerId: 'W002', workerName: '李四', equipmentId: 'EQ002', equipmentName: '车床02', workDate: '2025-03-27', startTime: '08:00', endTime: '17:00', workHours: 8, workTimeType: '正常工时', outputQuantity: 20, qualifiedQuantity: 19, status: '待核销', createdAt: '2025-03-27 17:30:00' },
  { id: '3', recordId: 'WT20250326001', workOrderId: 'WO25030002', workOrderNo: 'WO-2025-03002', productId: 'P002', productName: '产品B', processId: 'PROC002', processName: '铣削', workerId: 'W001', workerName: '张三', equipmentId: 'EQ003', equipmentName: '铣床01', workDate: '2025-03-26', startTime: '08:00', endTime: '20:00', workHours: 10, workTimeType: '加班工时', outputQuantity: 15, qualifiedQuantity: 15, status: '已核销', createdAt: '2025-03-26 20:30:00', verifiedAt: '2025-03-27 09:00:00', verifiedBy: '管理员' },
  { id: '4', recordId: 'WT20250325001', workOrderId: 'WO25030003', workOrderNo: 'WO-2025-03003', productId: 'P003', productName: '产品C', processId: 'PROC003', processName: '磨削', workerId: 'W003', workerName: '王五', equipmentId: 'EQ004', equipmentName: '磨床01', workDate: '2025-03-25', startTime: '08:00', endTime: '18:00', workHours: 8, workTimeType: '正常工时', outputQuantity: 50, qualifiedQuantity: 48, status: '已核销', createdAt: '2025-03-25 18:00:00', verifiedAt: '2025-03-26 10:00:00', verifiedBy: '管理员' },
]

const mockVerifications: WorkTimeVerification[] = [
  { id: '1', verificationId: 'VF20250326001', recordId: '3', recordIds: ['3'], workOrderId: 'WO25030002', totalHours: 10, verifierId: 'ADMIN', verifierName: '管理员', verificationDate: '2025-03-27', status: '已核销' },
  { id: '2', verificationId: 'VF20250325001', recordId: '4', recordIds: ['4'], workOrderId: 'WO25030003', totalHours: 8, verifierId: 'ADMIN', verifierName: '管理员', verificationDate: '2025-03-26', status: '已核销' },
]

// 获取时区偏移
const getTimezoneOffset = () => {
  const offset = new Date().getTimezoneOffset()
  const absOffset = Math.abs(offset)
  const hours = String(Math.floor(absOffset / 60)).padStart(2, '0')
  const minutes = String(absOffset % 60).padStart(2, '0')
  return `${offset <= 0 ? '+' : '-'}${hours}:${minutes}`
}

/**
 * 获取工时定额列表
 */
export async function getWorkTimeQuotas(params: PageParams & {
  productId?: string
  processId?: string
}): Promise<PageResponse<WorkTimeQuota>> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let data = [...mockQuotas]
        if (params.productId) {
          data = data.filter(item => item.productId === params.productId)
        }
        if (params.processId) {
          data = data.filter(item => item.processId === params.processId)
        }
        resolve({
          list: data,
          total: data.length,
          page: params.page,
          size: params.size,
          totalPages: Math.ceil(data.length / params.size),
        })
      }, 300)
    })
  }

  try {
    const isDev = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
    const baseURL = isDev ? '' : (import.meta.env.VITE_AIRIOT_API_URL || 'https://demo.airiot.link')
    const url = `${baseURL}/rest/core/t/${encodeURIComponent('工时定额')}/d?query=${encodeURIComponent(JSON.stringify({ skip: (params.page - 1) * params.size, limit: params.size, withCount: true }))}`

    const token = getToken()
    const projectId = import.meta.env.VITE_AIRIOT_PROJECT_ID || ''

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-request-project': projectId,
        'X-Request-TimeZone': getTimezoneOffset(),
      },
    })

    if (!response.ok) throw new Error(`API请求失败: ${response.status}`)

    const result = await response.json()
    return {
      list: result.items || [],
      total: result.total || 0,
      page: params.page,
      size: params.size,
      totalPages: Math.ceil((result.total || 0) / params.size),
    }
  } catch (error: any) {
    throw new Error(error.message || '获取工时定额失败')
  }
}

/**
 * 获取工时记录列表
 */
export async function getWorkTimeRecords(params: PageParams & {
  status?: string
  workerId?: string
  workOrderId?: string
  workDate?: string
}): Promise<PageResponse<WorkTimeRecord>> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let data = [...mockRecords]
        if (params.status) {
          data = data.filter(item => item.status === params.status)
        }
        if (params.workerId) {
          data = data.filter(item => item.workerId === params.workerId)
        }
        if (params.workOrderId) {
          data = data.filter(item => item.workOrderId === params.workOrderId)
        }
        if (params.workDate) {
          data = data.filter(item => item.workDate === params.workDate)
        }
        // 搜索过滤
        const searchText = (params as any).searchText
        if (searchText) {
          data = data.filter(item => 
            item.recordId.toLowerCase().includes(searchText.toLowerCase()) ||
            item.workOrderNo.toLowerCase().includes(searchText.toLowerCase()) ||
            item.productName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.workerName.toLowerCase().includes(searchText.toLowerCase())
          )
        }
        resolve({
          list: data,
          total: data.length,
          page: params.page,
          size: params.size,
          totalPages: Math.ceil(data.length / params.size),
        })
      }, 300)
    })
  }

  try {
    const isDev = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
    const baseURL = isDev ? '' : (import.meta.env.VITE_AIRIOT_API_URL || 'https://demo.airiot.link')
    
    const wheres: any[] = []
    if (params.status) wheres.push({ field: 'status', operator: 'eq', value: params.status })
    if (params.workerId) wheres.push({ field: 'workerId', operator: 'eq', value: params.workerId })
    if (params.workOrderId) wheres.push({ field: 'workOrderId', operator: 'eq', value: params.workOrderId })
    if (params.workDate) wheres.push({ field: 'workDate', operator: 'eq', value: params.workDate })

    const url = `${baseURL}/rest/core/t/${encodeURIComponent('工时记录')}/d?query=${encodeURIComponent(JSON.stringify({ skip: (params.page - 1) * params.size, limit: params.size, withCount: true }))}`

    const token = getToken()
    const projectId = import.meta.env.VITE_AIRIOT_PROJECT_ID || ''

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-request-project': projectId,
        'X-Request-TimeZone': getTimezoneOffset(),
      },
    })

    if (!response.ok) throw new Error(`API请求失败: ${response.status}`)

    const result = await response.json()
    return {
      list: result.items || [],
      total: result.total || 0,
      page: params.page,
      size: params.size,
      totalPages: Math.ceil((result.total || 0) / params.size),
    }
  } catch (error: any) {
    throw new Error(error.message || '获取工时记录失败')
  }
}

/**
 * 创建工时记录（报工）
 */
export async function createWorkTimeRecord(data: Partial<WorkTimeRecord>): Promise<WorkTimeRecord> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRecord: WorkTimeRecord = {
          id: String(mockRecords.length + 1),
          recordId: `WT${new Date().getTime()}`,
          workOrderId: data.workOrderId || '',
          workOrderNo: data.workOrderNo || '',
          productId: data.productId || '',
          productName: data.productName || '',
          processId: data.processId || '',
          processName: data.processName || '',
          workerId: data.workerId || '',
          workerName: data.workerName || '',
          equipmentId: data.equipmentId || '',
          equipmentName: data.equipmentName || '',
          workDate: data.workDate || new Date().toISOString().split('T')[0],
          startTime: data.startTime || '',
          endTime: data.endTime || '',
          workHours: data.workHours || 0,
          workTimeType: data.workTimeType || '正常工时',
          outputQuantity: data.outputQuantity || 0,
          qualifiedQuantity: data.qualifiedQuantity || 0,
          status: '待核销',
          createdAt: new Date().toISOString(),
        }
        mockRecords.push(newRecord)
        resolve(newRecord)
      }, 300)
    })
  }

  try {
    const isDev = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
    const baseURL = isDev ? '' : (import.meta.env.VITE_AIRIOT_API_URL || 'https://demo.airiot.link')
    const url = `${baseURL}/rest/core/t/${encodeURIComponent('工时记录')}/d`

    const token = getToken()
    const projectId = import.meta.env.VITE_AIRIOT_PROJECT_ID || ''

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-request-project': projectId,
        'X-Request-TimeZone': getTimezoneOffset(),
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) throw new Error(`API请求失败: ${response.status}`)

    return await response.json()
  } catch (error: any) {
    throw new Error(error.message || '创建工时记录失败')
  }
}

/**
 * 核销工时记录
 */
export async function verifyWorkTimeRecords(recordIds: string[], verifierId: string, verifierName: string, remark?: string): Promise<WorkTimeVerification> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const records = mockRecords.filter(r => recordIds.includes(r.id))
        const totalHours = records.reduce((sum, r) => sum + r.workHours, 0)
        
        // 更新记录状态
        records.forEach(r => {
          r.status = '已核销'
          r.verifiedAt = new Date().toISOString()
          r.verifiedBy = verifierName
        })

        const verification: WorkTimeVerification = {
          id: String(mockVerifications.length + 1),
          verificationId: `VF${new Date().getTime()}`,
          recordId: recordIds[0],
          recordIds: recordIds,
          workOrderId: records[0]?.workOrderId || '',
          totalHours,
          verifierId,
          verifierName,
          verificationDate: new Date().toISOString().split('T')[0],
          status: '已核销',
          remark,
        }
        mockVerifications.push(verification)
        resolve(verification)
      }, 300)
    })
  }

  try {
    const isDev = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
    const baseURL = isDev ? '' : (import.meta.env.VITE_AIRIOT_API_URL || 'https://demo.airiot.link')
    const url = `${baseURL}/rest/core/t/${encodeURIComponent('工时核销')}/d`

    const token = getToken()
    const projectId = import.meta.env.VITE_AIRIOT_PROJECT_ID || ''

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-request-project': projectId,
        'X-Request-TimeZone': getTimezoneOffset(),
      },
      body: JSON.stringify({
        recordIds,
        verifierId,
        verifierName,
        verificationDate: new Date().toISOString().split('T')[0],
        remark,
      }),
    })

    if (!response.ok) throw new Error(`API请求失败: ${response.status}`)

    return await response.json()
  } catch (error: any) {
    throw new Error(error.message || '核销工时失败')
  }
}

/**
 * 获取工时核销记录
 */
export async function getWorkTimeVerifications(params: PageParams): Promise<PageResponse<WorkTimeVerification>> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          list: mockVerifications,
          total: mockVerifications.length,
          page: params.page,
          size: params.size,
          totalPages: Math.ceil(mockVerifications.length / params.size),
        })
      }, 300)
    })
  }

  try {
    const isDev = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
    const baseURL = isDev ? '' : (import.meta.env.VITE_AIRIOT_API_URL || 'https://demo.airiot.link')
    const url = `${baseURL}/rest/core/t/${encodeURIComponent('工时核销')}/d?query=${encodeURIComponent(JSON.stringify({ skip: (params.page - 1) * params.size, limit: params.size, withCount: true }))}`

    const token = getToken()
    const projectId = import.meta.env.VITE_AIRIOT_PROJECT_ID || ''

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-request-project': projectId,
        'X-Request-TimeZone': getTimezoneOffset(),
      },
    })

    if (!response.ok) throw new Error(`API请求失败: ${response.status}`)

    const result = await response.json()
    return {
      list: result.items || [],
      total: result.total || 0,
      page: params.page,
      size: params.size,
      totalPages: Math.ceil((result.total || 0) / params.size),
    }
  } catch (error: any) {
    throw new Error(error.message || '获取核销记录失败')
  }
}

/**
 * 获取工时统计数据
 */
export async function getWorkTimeStats(params: {
  startDate?: string
  endDate?: string
  workerId?: string
  equipmentId?: string
}): Promise<WorkTimeStats> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let data = [...mockRecords]
        if (params.startDate) {
          data = data.filter(item => item.workDate >= params.startDate!)
        }
        if (params.endDate) {
          data = data.filter(item => item.workDate <= params.endDate!)
        }
        if (params.workerId) {
          data = data.filter(item => item.workerId === params.workerId)
        }
        if (params.equipmentId) {
          data = data.filter(item => item.equipmentId === params.equipmentId)
        }

        // 计算统计数据
        const totalHours = data.reduce((sum, r) => sum + r.workHours, 0)
        const normalHours = data.filter(r => r.workTimeType === '正常工时').reduce((sum, r) => sum + r.workHours, 0)
        const overtimeHours = data.filter(r => r.workTimeType === '加班工时').reduce((sum, r) => sum + r.workHours, 0)
        const restHours = data.filter(r => r.workTimeType === '休息日工时').reduce((sum, r) => sum + r.workHours, 0)
        const verifiedHours = data.filter(r => r.status === '已核销').reduce((sum, r) => sum + r.workHours, 0)
        const pendingHours = data.filter(r => r.status === '待核销').reduce((sum, r) => sum + r.workHours, 0)

        // 按人员统计
        const workerMap = new Map<string, WorkerTimeStats>()
        data.forEach(r => {
          const existing = workerMap.get(r.workerId)
          if (existing) {
            existing.totalHours += r.workHours
            existing.outputQuantity += r.outputQuantity
            existing.qualifiedQuantity += r.qualifiedQuantity
          } else {
            workerMap.set(r.workerId, {
              workerId: r.workerId,
              workerName: r.workerName,
              totalHours: r.workHours,
              outputQuantity: r.outputQuantity,
              qualifiedQuantity: r.qualifiedQuantity,
              qualifiedRate: 0,
            })
          }
        })
        workerMap.forEach(w => {
          w.qualifiedRate = w.outputQuantity > 0 ? (w.qualifiedQuantity / w.outputQuantity) * 100 : 0
        })

        // 按设备统计
        const equipmentMap = new Map<string, EquipmentTimeStats>()
        data.forEach(r => {
          const existing = equipmentMap.get(r.equipmentId)
          if (existing) {
            existing.totalHours += r.workHours
          } else {
            equipmentMap.set(r.equipmentId, {
              equipmentId: r.equipmentId,
              equipmentName: r.equipmentName,
              totalHours: r.workHours,
              utilization: 0,
            })
          }
        })
        equipmentMap.forEach(e => {
          e.utilization = (e.totalHours / 240) * 100 // 假设240小时/月
        })

        // 按日期统计
        const dailyMap = new Map<string, DailyTimeStats>()
        data.forEach(r => {
          const existing = dailyMap.get(r.workDate)
          if (existing) {
            existing.totalHours += r.workHours
            existing.outputQuantity += r.outputQuantity
          } else {
            dailyMap.set(r.workDate, {
              date: r.workDate,
              totalHours: r.workHours,
              outputQuantity: r.outputQuantity,
            })
          }
        })

        resolve({
          totalHours,
          normalHours,
          overtimeHours,
          restHours,
          verifiedHours,
          pendingHours,
          workerStats: Array.from(workerMap.values()),
          equipmentStats: Array.from(equipmentMap.values()),
          dailyStats: Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
        })
      }, 300)
    })
  }

  // 真实API实现
  try {
    // ... (类似实现)
    return {
      totalHours: 0,
      normalHours: 0,
      overtimeHours: 0,
      restHours: 0,
      verifiedHours: 0,
      pendingHours: 0,
      workerStats: [],
      equipmentStats: [],
      dailyStats: [],
    }
  } catch (error: any) {
    throw new Error(error.message || '获取工时统计失败')
  }
}
