// 库存服务 - 使用官方 @airiot/client SDK
import { createCatalogAPI, createTableRecordAPI } from '@/lib/airiot-client'
import { mockData } from '@/lib/mock-data'
import type { PageParams, PageResponse } from '@/types/api'
import { getToken } from '@/lib/auth-token'

// 表ID配置
const MATERIAL_MODEL_ID = '物料'
const INVENTORY_TRANSACTION_MODEL_ID = '库存流水'

// 物料接口类型 - 使用AIRIOT schema字段
export interface Material {
  id: string
  'serial-number-1001': string    // 物料编码
  'text-1002': string              // 物料名称
  'select-1003': string            // 物料类型
  'text-1004': string              // 规格型号
  'text-1005': string              // 等级
  'text-1006': string              // 单位
  'number-1007': number            // 库存总量
  'number-1008': number            // 可用数量
  'select-1009': string            // 仓库
  'text-1010': string              // 库位
  'text-1011': string              // 批次号
  'text-1012': string              // 供应商
}

// 库存流水接口类型 - 使用AIRIOT schema字段
export interface InventoryTransaction {
  id: string
  'relation-2001': any             // 关联物料
  'select-2002': '入库' | '出库'    // 操作类型
  'number-2003': number            // 数量
  'text-2004': string              // 操作原因
  'text-2005': string              // 关联单据号
  'date-2006': string              // 操作时间
  'user-2007': any                 // 操作人
  'text-2008': string              // 备注
  createTime: string               // 创建时间
}

// 兼容旧类型（用于前端显示）
export interface MaterialDisplay {
  id: string
  materialId: string
  materialName: string
  materialType: string
  spec: string
  grade: string
  unit: string
  warehouse: string
  location: string
  quantity: number
  availableQty: number
  batchNo: string
  supplier: string
}

/**
 * 将AIRIOT Material转换为Display格式
 */
function toMaterialDisplay(material: Material): MaterialDisplay {
  return {
    id: material.id,
    materialId: material['serial-number-1001'],
    materialName: material['text-1002'],
    materialType: material['select-1003'],
    spec: material['text-1004'] || '',
    grade: material['text-1005'] || '',
    unit: material['text-1006'] || '',
    warehouse: material['select-1009'],
    location: material['text-1010'] || '',
    quantity: material['number-1007'],
    availableQty: material['number-1008'],
    batchNo: material['text-1011'] || '',
    supplier: material['text-1012'] || '',
  }
}

/**
 * 获取物料列表
 */
export async function getMaterials(params: PageParams & {
  materialType?: string
  warehouse?: string
  search?: string
}): Promise<PageResponse<MaterialDisplay>> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let data = [...mockData.materials]

        // 过滤
        if (params.materialType) {
          data = data.filter(item => item.materialType === params.materialType)
        }
        if (params.warehouse) {
          data = data.filter(item => item.warehouse === params.warehouse)
        }
        if (params.search) {
          const search = params.search.toLowerCase()
          data = data.filter(item =>
            item.materialId.toLowerCase().includes(search) ||
            item.materialName.toLowerCase().includes(search)
          )
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

  // 真实API
  try {
    const api = createCatalogAPI()

    // 构建查询过滤条件 - 使用AIRIOT schema字段
    const wheres: any[] = []

    if (params.materialType) {
      wheres.push({
        field: 'select-1003',
        operator: 'eq',
        value: params.materialType,
      })
    }
    if (params.warehouse) {
      wheres.push({
        field: 'select-1009',
        operator: 'eq',
        value: params.warehouse,
      })
    }
    if (params.search) {
      wheres.push({
        field: 'serial-number-1001',
        operator: 'like',
        value: params.search,
      })
      wheres.push({
        field: 'text-1002',
        operator: 'like',
        value: params.search,
      })
    }

    const { items, total } = await api.query(
      { tableId: MATERIAL_MODEL_ID },
      wheres,
      true,
      {
        skip: (params.page - 1) * params.size,
        limit: params.size,
      }
    )

    // 转换为Display格式
    const displayItems = (items || []).map(toMaterialDisplay)

    return {
      list: displayItems,
      total: total || 0,
      page: params.page,
      size: params.size,
      totalPages: Math.ceil((total || 0) / params.size),
    }
  } catch (error: any) {
    throw new Error(error.message || '获取物料列表失败')
  }
}

/**
 * 获取物料详情
 */
export async function getMaterialDetail(id: string): Promise<MaterialDisplay> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    const material = mockData.materials.find(item => item.id === id)
    if (!material) {
      throw new Error('物料不存在')
    }
    return Promise.resolve(material)
  }

  try {
    const api = createCatalogAPI()
    const result = await api.get(id, { tableId: MATERIAL_MODEL_ID })
    return toMaterialDisplay(result as Material)
  } catch (error: any) {
    throw new Error(error.message || '获取物料详情失败')
  }
}

/**
 * 获取物料的出入库记录
 * 根据物料ID查询库存流水表
 */
export async function getMaterialTransactions(materialId: string, params: PageParams = {
  page: 1,
  size: 20
}): Promise<PageResponse<InventoryTransaction>> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    // Mock数据 - 返回空的交易记录
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          list: [],
          total: 0,
          page: params.page,
          size: params.size,
          totalPages: 0,
        })
      }, 300)
    })
  }

  // 真实API - 查询库存流水表，过滤条件为关联物料
  try {
    const api = createCatalogAPI()

    // 构建查询过滤条件 - 关联物料字段
    const wheres: any[] = [
      {
        field: 'relation-2001',
        operator: 'eq',
        value: materialId,
      }
    ]

    const { items, total } = await api.query(
      { tableId: INVENTORY_TRANSACTION_MODEL_ID },
      wheres,
      true, // 按创建时间倒序
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
    throw new Error(error.message || '获取物料流水记录失败')
  }
}

/**
 * 创建出入库记录
 * 同时更新物料的库存数量
 */
export async function createInventoryTransaction(data: {
  materialId: string
  transactionType: '入库' | '出库'
  quantity: number
  reason?: string
  orderNo?: string
  remark?: string
}): Promise<void> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return Promise.resolve()
  }

  try {
    // 1. 获取当前物料信息
    const material = await getMaterialDetail(data.materialId)

    // 2. 验证出库数量
    if (data.transactionType === '出库' && data.quantity > material.availableQty) {
      throw new Error(`可用库存不足，当前可用: ${material.availableQty}`)
    }

    // 3. 创建库存流水记录
    const transactionAPI = createTableRecordAPI(INVENTORY_TRANSACTION_MODEL_ID)
    await transactionAPI.save({
      'relation-2001': data.materialId,
      'select-2002': data.transactionType,
      'number-2003': data.quantity,
      'text-2004': data.reason || '',
      'text-2005': data.orderNo || '',
      'date-2006': new Date().toISOString(),
      'text-2008': data.remark || '',
    })

    // 4. 更新物料库存数量
    const materialAPI = createTableRecordAPI(MATERIAL_MODEL_ID)
    const newTotalQty = data.transactionType === '入库'
      ? material.quantity + data.quantity
      : material.quantity - data.quantity
    const newAvailableQty = data.transactionType === '入库'
      ? material.availableQty + data.quantity
      : material.availableQty - data.quantity

    await materialAPI.save({
      id: data.materialId,
      'number-1007': newTotalQty,
      'number-1008': newAvailableQty,
    }, true) // partial=true
  } catch (error: any) {
    throw new Error(error.message || '创建出入库记录失败')
  }
}

/**
 * 创建物料领用申请
 */
export async function createMaterialRequisition(data: {
  materialId: string
  quantity: number
  purpose: string
}): Promise<any> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return Promise.resolve({ id: `req-${Date.now()}` })
  }

  try {
    const api = createCatalogAPI()
    const result = await api.save({
      ...data,
      tableId: 'material_requisitions',
    })
    return result
  } catch (error: any) {
    throw new Error(error.message || '创建领用申请失败')
  }
}

/**
 * 获取库存统计
 */
export async function getInventoryStats(): Promise<{
  totalMaterials: number
  lowStockItems: number
  totalValue: number
  warehouseStats: Array<{ warehouse: string; count: number }>
}> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return Promise.resolve({
      totalMaterials: 200,
      lowStockItems: 12,
      totalValue: 1250000,
      warehouseStats: [
        { warehouse: '一级库', count: 85 },
        { warehouse: '二级库', count: 45 },
        { warehouse: '半成品库', count: 35 },
        { warehouse: '成品库', count: 25 },
        { warehouse: '刀具室', count: 10 },
      ],
    })
  }

  // 真实API实现 - AIRIOT库存统计查询
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
      'Authorization': `Bearer ${token}`,
      'x-request-project': projectId,
      'X-Request-TimeZone': getTimezoneOffset(),
    }

    // 查询物料列表
    const queryParam = JSON.stringify({ limit: 1000, skip: 0, withCount: true })
    const url = `${baseURL}/rest/core/t/${encodeURIComponent('物料')}/d?query=${encodeURIComponent(queryParam)}`

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) throw new Error(`API请求失败: ${response.status}`)

    const result = await response.json()
    const items = Array.isArray(result) ? result : result.items || []

    // 计算统计数据
    const totalMaterials = items.length
    const lowStockItems = items.filter((item: any) => item['number-1008'] < 10).length
    const totalValue = items.reduce((sum: number, item: any) => sum + (item['number-1007'] || 0) * 100, 0)

    // 按仓库分组统计
    const warehouseMap = new Map<string, number>()
    items.forEach((item: any) => {
      const warehouse = item['select-1009'] || '未分类'
      warehouseMap.set(warehouse, (warehouseMap.get(warehouse) || 0) + 1)
    })

    const warehouseStats = Array.from(warehouseMap.entries()).map(([warehouse, count]) => ({
      warehouse,
      count,
    }))

    return {
      totalMaterials,
      lowStockItems,
      totalValue,
      warehouseStats,
    }
  } catch (error: any) {
    return {
      totalMaterials: 0,
      lowStockItems: 0,
      totalValue: 0,
      warehouseStats: [],
    }
  }
}

/**
 * 创建物料
 */
export async function createMaterial(data: Partial<Material>): Promise<MaterialDisplay> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return Promise.resolve({
      id: `material-${Date.now()}`,
      materialId: data['serial-number-1001'] || '',
      materialName: data['text-1002'] || '',
      materialType: data['select-1003'] || '原材料',
      spec: data['text-1004'] || '',
      grade: data['text-1005'] || '',
      unit: data['text-1006'] || '',
      warehouse: data['select-1009'] || '',
      location: data['text-1010'] || '',
      quantity: data['number-1007'] || 0,
      availableQty: data['number-1008'] || 0,
      batchNo: data['text-1011'] || '',
      supplier: data['text-1012'] || '',
    })
  }

  try {
    const api = createTableRecordAPI(MATERIAL_MODEL_ID)
    const result = await api.save(data)
    return toMaterialDisplay(result as Material)
  } catch (error: any) {
    throw new Error(error.message || '创建物料失败')
  }
}

/**
 * 更新物料
 */
export async function updateMaterial(id: string, data: Partial<Material>): Promise<void> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return Promise.resolve()
  }

  try {
    const api = createTableRecordAPI(MATERIAL_MODEL_ID)
    await api.save({ id, ...data }, true) // partial=true
  } catch (error: any) {
    throw new Error(error.message || '更新物料失败')
  }
}

/**
 * 删除物料
 */
export async function deleteMaterial(id: string): Promise<void> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return Promise.resolve()
  }

  try {
    const api = createCatalogAPI()
    await api.delete(id)
  } catch (error: any) {
    throw new Error(error.message || '删除物料失败')
  }
}
