// 订单下发服务 - 使用官方 @airiot/client SDK
import { createAPI } from '@airiot/client'
import { createTableRecordAPI } from '@/lib/airiot-client'
import { mockData } from '@/lib/mock-data'
import type { PageParams, PageResponse } from '@/types/api'
import { getToken } from '@/lib/auth-token'

// 订单录入表ID（用于关联字段）- 投产通知单
const ORDER_MODEL_ID = '投产通知单'

// 订单下发表ID - 生产计划单下发
const DISPATCH_MODEL_ID = '生产计划单下发'

// 创建 @airiot/client API 实例（单例）
let _dispatchAPI: ReturnType<typeof createAPI> | null = null
function getDispatchAPI() {
  if (!_dispatchAPI) {
    _dispatchAPI = createAPI({
      resource: `core/t/${DISPATCH_MODEL_ID}/d`,
    })
  }
  return _dispatchAPI
}

/**
 * 表Schema类型定义
 * 接口返回结构：{ schema: { form: [...], properties: {...}, required: [...] } }
 */
export interface TableSchema {
  schema: {
    form?: string[]     // 字段展示顺序（在 schema 对象内）
    properties?: Record<string, SchemaField>
    required?: string[]
    [key: string]: any
  }
  [key: string]: any
}

/**
 * Schema字段定义
 */
export interface SchemaField {
  type: string
  title?: string
  description?: string
  format?: string
  enum?: any[]
  enumNames?: any
  properties?: Record<string, SchemaField>
  items?: SchemaField
  required?: string[]
  readonly?: string[]
  ignore?: string[]
  form?: any
  field?: any
  [key: string]: any
}

/**
 * 订单下发数据类型（简化字段名，用于页面显示）
 */
export interface OrderDispatch {
  id: string
  planNumber: string           // 计划编号 (serial-number-3F58)
  productCode: string          // 产品令号 (text-9AFE)
  productionNumber: string     // 生产单编号 (serial-number-7126)
  executionUnit: string        // 执行单位 (serial-number-99E5)
  relatedOrderId: string       // 关联订单ID (relate-table-0A5C)
  relatedOrderNo: string       // 关联订单编号显示
  hasHistory: string           // 是否有历史记录 (text-B352)
  quantity: number             // 数量 (number-256F)
  deliveryDate: string         // 交付时间 (date-971A)
  taskContent: string          // 任务内容 (text-6BBD)
  productionType: string       // 生产类型：1-外协，2-批产，3-研产 (select-0362)
  attachment?: any             // 生产附件 (upload-single-AE62)
  createTime?: string          // 订单记录时间
  creator?: string             // 生产单创建人
}

/**
 * 订单下发表单数据类型（schema字段名，用于提交）
 */
export interface OrderDispatchFormData {
  [key: string]: any
  'text-9AFE'?: string          // 产品令号
  'relate-table-0A5C'?: any      // 关联订单对象
  'text-B352'?: string           // 是否有历史相关生产记录
  'number-256F'?: number         // 数量
  'date-971A'?: string           // 产品交付时间
  'text-6BBD'?: string           // 任务内容
  'select-0362'?: string         // 生产类型
  'upload-single-AE62'?: any     // 生产附件
}

/**
 * 从 AIRIOT 数据转换为页面数据
 */
function transformFromAiriotData(item: any): OrderDispatch {
  // 处理关联订单字段 - 可能是对象或字符串
  const relatedOrder = item['relate-table-0A5C']
  const relatedOrderId = typeof relatedOrder === 'object' && relatedOrder?.id
    ? relatedOrder.id
    : (relatedOrder || '')

  // 关联订单编号显示：优先使用 serial-number-1773，其次 name，最后使用 ID
  let relatedOrderNo = ''
  if (typeof relatedOrder === 'object' && relatedOrder !== null) {
    relatedOrderNo = relatedOrder['serial-number-1773'] || relatedOrder.name || `订单-${relatedOrderId}`
  } else if (relatedOrder) {
    relatedOrderNo = `订单-${relatedOrderId}`
  }

  // 处理其他可能的关联字段
  const _pdv = (() => {
    const v = item['processDrawing']
    return typeof v === 'object' && v?.id ? v.id : (v || '')
  })()
  void _pdv

  const _pldv = (() => {
    const v = item['partDrawing']
    return typeof v === 'object' && v?.id ? v.id : (v || '')
  })()
  void _pldv

  const _pd9v = (() => {
    const v = item['partDrawi9C53']
    return typeof v === 'object' && v?.id ? v.id : (v || '')
  })()
  void _pd9v

  const uploadSingleAE62 = item['upload-single-AE62']
  const uploadSingleAE62Value = typeof uploadSingleAE62 === 'object' && uploadSingleAE62?.id
    ? uploadSingleAE62.id
    : (uploadSingleAE62 || '')

  return {
    id: item.id,
    planNumber: item['serial-number-3F58'] || '',
    productCode: item['text-9AFE'] || '',
    productionNumber: item['serial-number-7126'] || '',
    executionUnit: item['serial-number-99E5'] || '',
    relatedOrderId,
    relatedOrderNo,
    hasHistory: item['text-B352'] || '',
    quantity: item['number-256F'] || 0,
    deliveryDate: item['date-971A'] || '',
    taskContent: item['text-6BBD'] || '',
    productionType: item['select-0362'] || '',
    attachment: uploadSingleAE62Value || undefined,
    createTime: item.createTime,
    creator: typeof item.creator === 'object' && item.creator?.name
      ? item.creator.name
      : (item.creator || '')
  }
}

/**
 * 获取订单下发表的Schema
 * 接口路径：/rest/core/t/schema/生产计划单下发
 * 注意：@airiot/client 没有提供 schema 接口，继续使用 fetch
 */
export async function getOrderDispatchSchema(): Promise<TableSchema> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    // Mock schema - 返回一个基本的schema结构
    return Promise.resolve({
      schema: {
        'serial-number-3F58': { type: 'string', title: '计划编号' },
        'text-9AFE': { type: 'string', title: '产品令号' },
        'serial-number-7126': { type: 'string', title: '生产单编号' },
        'serial-number-99E5': { type: 'string', title: '执行单位' },
        'relate-table-0A5C': { type: 'string', title: '关联订单编号' },
        'text-B352': { type: 'string', title: '是否有历史记录' },
        'number-256F': { type: 'number', title: '数量' },
        'date-971A': { type: 'string', format: 'date', title: '交付时间' },
        'text-6BBD': { type: 'string', title: '任务内容' },
        'select-0362': { type: 'string', title: '生产类型', enum: ['1', '2', '3'] },
        'upload-single-AE62': { type: 'any', title: '生产附件' },
      }
    })
  }

  try {
    // @airiot/client 没有提供 schema 接口，使用 fetch 请求
    const isDev = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
    const baseURL = isDev ? '' : (import.meta.env.VITE_AIRIOT_API_URL || 'https://demo.airiot.link')
    const url = `${baseURL}/rest/core/t/schema/${encodeURIComponent(DISPATCH_MODEL_ID)}`

    const token = getToken()
    const projectId = import.meta.env.VITE_AIRIOT_PROJECT_ID || ''

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (projectId) headers['x-request-project'] = projectId

    const response = await fetch(url, { method: 'GET', headers })

    if (!response.ok) {
      throw new Error(`获取Schema失败: ${response.status} ${response.statusText}`)
    }

    const schemaData = await response.json()
    return schemaData
  } catch (error: any) {
    throw new Error(error.message || '获取订单下发Schema失败')
  }
}

/**
 * 根据Schema构建project参数
 * 用于查询接口的project字段
 */
export function buildProjectFromSchema(schema: TableSchema): Record<string, number> {
  const project: Record<string, number> = {}

  if (!schema) {
    return project
  }

  // schema可能是 { schema: { ... } } 或直接的 { ... } 对象
  const schemaFields = schema.schema || schema

  if (!schemaFields || typeof schemaFields !== 'object') {
    return project
  }

  // 从schema.properties获取字段列表
  if (schemaFields.properties && typeof schemaFields.properties === 'object') {
    const fieldKeys = Object.keys(schemaFields.properties)
    fieldKeys.forEach(field => {
      project[field] = 1
    })

    // 确保必需字段存在
    const requiredFields = ['relate-table-0A5C', 'createTime', 'creator']
    requiredFields.forEach(field => {
      if (!project[field]) {
        project[field] = 1
      }
    })
  }

  return project
}

/**
 * 获取订单下发列表
 * 使用 @airiot/client 的 createAPI().query() 方法
 */
export async function getOrderDispatches(
  params: PageParams & {
    productionType?: string
    search?: string
  },
  schema?: TableSchema
): Promise<PageResponse<OrderDispatch>> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    // Mock数据
    return new Promise((resolve) => {
      setTimeout(() => {
        let data = [...mockData.orderDispatch]

        // 过滤
        if (params.productionType && params.productionType !== 'all') {
          data = data.filter(item => item.productionType === params.productionType)
        }
        if (params.search) {
          const search = params.search.toLowerCase()
          data = data.filter(item =>
            item.planNumber.toLowerCase().includes(search) ||
            item.productCode.toLowerCase().includes(search) ||
            item.relatedOrderNo.toLowerCase().includes(search)
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

  // 真实API - 使用 @airiot/client 的 createAPI().query() 方法
  try {
    const api = getDispatchAPI()

    // 构建查询过滤条件
    const wheres: any[] = []

    if (params.productionType && params.productionType !== 'all') {
      wheres.push({
        field: 'select-0362',
        operator: 'eq',
        value: params.productionType,
      })
    }
    if (params.search) {
      wheres.push({
        field: 'serial-number-3F58',
        operator: 'like',
        value: params.search,
      })
      wheres.push({
        field: 'text-9AFE',
        operator: 'like',
        value: params.search,
      })
    }

    // 构建 filter 参数
    const filter: any = {
      skip: (params.page - 1) * params.size,
      limit: params.size,
    }


    // 使用 @airiot/client 的 query 方法
    const { items, total } = await api.query(
      filter,
      wheres.length > 0 ? wheres : undefined,
      true
    )


    const transformedItems = items.map(transformFromAiriotData)

    return {
      list: transformedItems,
      total,
      page: params.page,
      size: params.size,
      totalPages: Math.ceil(total / params.size),
    }
  } catch (error: any) {
    throw new Error(error.message || '获取订单下发列表失败')
  }
}

/**
 * 获取订单录入列表（用于关联字段选择）
 * 只返回状态为"订单录入"的订单
 */
export async function getOrdersForDispatch(): Promise<any[]> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    // Mock数据 - 返回状态为"订单录入"的订单
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = mockData.productionOrders
          .filter((order: any) => order.status === '订单录入')
          .map((order: any) => ({
            id: order.id,
            'serial-number-1773': order.orderNo,
            'text-1C5B': order.productName,
            'number-4DE1': order.quantity,
          }))
        resolve(orders)
      }, 300)
    })
  }

  // 真实API - 使用 @airiot/client 的 createAPI().query() 方法
  try {
    const orderAPI = createAPI({
      resource: `core/t/${ORDER_MODEL_ID}/d`,
    })

    const { items } = await orderAPI.query(
      { skip: 0, limit: 1000 },
      [{
        field: 'done',
        operator: 'eq',
        value: '订单录入',
      }],
      false
    )

    return items || []
  } catch (error: any) {
    throw new Error(error.message || '获取订单录入列表失败')
  }
}

/**
 * 创建订单下发
 * 严格按照生产订单的保存方式
 */
export async function createOrderDispatch(formData: OrderDispatchFormData): Promise<OrderDispatch> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const year = new Date().getFullYear()
        const random = Math.floor(Math.random() * 9000) + 1000

        const newDispatch: OrderDispatch = {
          id: `dispatch-${Date.now()}`,
          planNumber: `${year}${random}`,
          productCode: formData['text-9AFE'] || '',
          productionNumber: Math.floor(Math.random() * 10000000000).toString().padStart(10, '0'),
          executionUnit: Math.floor(Math.random() * 10000000000).toString().padStart(10, '0'),
          relatedOrderId: formData['relate-table-0A5C'] || '',
          relatedOrderNo: formData['relate-table-0A5C'] ? `订单-${formData['relate-table-0A5C']}` : '',
          hasHistory: formData['text-B352'] || '否',
          quantity: formData['number-256F'] || 0,
          deliveryDate: formData['date-971A'] || '',
          taskContent: formData['text-6BBD'] || '',
          productionType: formData['select-0362'] || '2',
          attachment: formData['upload-single-AE62'],
          createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
          creator: '当前用户',
        }
        resolve(newDispatch)
      }, 500)
    })
  }

  try {
    // 创建专门针对订单下发表的 API 实例
    const api = createTableRecordAPI(DISPATCH_MODEL_ID)

    // 调用 save 方法
    const result = await api.save({
      'text-9AFE': formData['text-9AFE'],
      'relate-table-0A5C': formData['relate-table-0A5C'],
      'text-B352': formData['text-B352'],
      'number-256F': formData['number-256F'],
      'date-971A': formData['date-971A'],
      'text-6BBD': formData['text-6BBD'],
      'select-0362': formData['select-0362'],
      'upload-single-AE62': formData['upload-single-AE62'],
    })

    // 转换返回的数据
    return transformFromAiriotData(result)
  } catch (error: any) {
    throw new Error(error.message || '创建订单下发失败')
  }
}

/**
 * 获取订单下发详情
 */
export async function getOrderDispatchDetail(id: string): Promise<OrderDispatch> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const dispatch = mockData.orderDispatch.find((item: any) => item.id === id)
        if (dispatch) {
          resolve(dispatch)
        } else {
          reject(new Error('订单下发不存在'))
        }
      }, 300)
    })
  }

  try {
    // 使用 createTableRecordAPI 获取详情
    const api = createTableRecordAPI(DISPATCH_MODEL_ID)
    const result = await api.get(id)
    return transformFromAiriotData(result)
  } catch (error: any) {
    throw new Error(error.message || '获取订单下发详情失败')
  }
}

/**
 * 更新订单下发
 * 严格按照生产订单的更新方式
 */
export async function updateOrderDispatch(id: string, formData: OrderDispatchFormData): Promise<void> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return Promise.resolve()
  }

  try {
    // 创建专门针对订单下发表的 API 实例
    const api = createTableRecordAPI(DISPATCH_MODEL_ID)

    // 调用 save 方法更新，partial=true 表示部分更新
    await api.save({
      id,  // 包含 id 用于标识记录
      'text-9AFE': formData['text-9AFE'],
      'relate-table-0A5C': formData['relate-table-0A5C'],
      'text-B352': formData['text-B352'],
      'number-256F': formData['number-256F'],
      'date-971A': formData['date-971A'],
      'text-6BBD': formData['text-6BBD'],
      'select-0362': formData['select-0362'],
      'upload-single-AE62': formData['upload-single-AE62'],
    }, true)  // partial=true，表示部分更新
  } catch (error: any) {
    throw new Error(error.message || '更新订单下发失败')
  }
}

/**
 * 删除订单下发
 * 严格按照生产订单的删除方式
 */
export async function deleteOrderDispatch(id: string): Promise<void> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return Promise.resolve()
  }

  try {
    // 使用 createTableRecordAPI 删除
    const api = createTableRecordAPI(DISPATCH_MODEL_ID)
    await api.delete(id)
  } catch (error: any) {
    throw new Error(error.message || '删除订单下发失败')
  }
}
