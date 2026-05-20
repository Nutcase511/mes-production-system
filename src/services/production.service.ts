// 生产计划服务 - 使用官方 @airiot/client SDK
import { createCatalogAPI, createTableRecordAPI } from '@/lib/airiot-client'
import { mockData } from '@/lib/mock-data'
import type { ProductionOrder, OrderStatus } from '@/types/production'
import type { PageParams, PageResponse } from '@/types/api'
import { getToken } from '@/lib/auth-token'

// 生产计划表表名：生产计划
const ORDER_MODEL_ID = '生产计划'

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
 * 生产订单表单数据类型（schema字段名，用于提交）
 */
export interface ProductionOrderFormData {
  'serial-number-1773'?: string  // 订单编号
  'text-B2EF'?: string           // 订单来源
  'done'?: string                // 订单状态
  'text-1C5B'?: string           // 产品名称
  'number-4DE1'?: number         // 产品数量
  'text-7CC5'?: string           // 规格型号
  'text-F185'?: string           // 详细参数
  'upload-single-AE62'?: any     // 订单图纸
  [key: string]: any  // 允许其他动态字段
}

/**
 * 获取生产订单列表
 * @param params - 分页和过滤参数
 * @param schema - 表Schema（可选），用于构建project参数
 */
export async function getProductionOrders(params: PageParams & {
  status?: string
  orderType?: string
  search?: string
}, schema?: TableSchema): Promise<PageResponse<ProductionOrder>> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    // Mock数据
    return new Promise((resolve) => {
      setTimeout(() => {
        let data = [...mockData.productionOrders]

        // 过滤
        if (params.status) {
          data = data.filter(item => item.status === params.status)
        }
        if (params.orderType) {
          data = data.filter(item => item.orderType === params.orderType)
        }
        if (params.search) {
          const search = params.search.toLowerCase()
          data = data.filter(item =>
            item.orderNo.toLowerCase().includes(search) ||
            item.productName.toLowerCase().includes(search)
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

  // 真实API - 直接使用 fetch 调用 REST API
  try {
    // 构建查询过滤条件
    const wheres: any[] = []

    if (params.status && params.status !== 'all') {
      wheres.push({
        field: 'done',
        operator: 'eq',
        value: params.status,
      })
    }
    if (params.orderType && params.orderType !== 'all') {
      wheres.push({
        field: 'orderType',
        operator: 'eq',
        value: params.orderType,
      })
    }
    if (params.search) {
      wheres.push({
        field: 'notificationNumber',
        operator: 'like',
        value: params.search,
      })
      wheres.push({
        field: 'customerName',
        operator: 'like',
        value: params.search,
      })
    }

    // 构建project参数
    let project: Record<string, number> = {}
    if (schema && schema.schema) {
      project = buildProjectFromSchema(schema)
    }

    // 构建查询参数 - 符合AIRIOT API格式
    const queryParam = {
      skip: (params.page - 1) * params.size,
      limit: params.size,
      ...(Object.keys(project).length > 0 && { project }),
      withCount: true
    }

      wheres,
      queryParam,
      schemaLoaded: !!schema,
    })

    // 构建请求URL
    const isDev = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
    const baseURL = isDev ? '' : (import.meta.env.VITE_AIRIOT_API_URL || 'https://demo.airiot.link')

    // 构建查询字符串
    const queryString = encodeURIComponent(JSON.stringify(queryParam))
    const url = `${baseURL}/rest/core/t/${encodeURIComponent(ORDER_MODEL_ID)}/d?query=${queryString}`

    // 从localStorage获取token
    const token = getToken()

    // 获取时区偏移
    const getTimezoneOffset = () => {
      const offset = (new Date()).getTimezoneOffset()
      const absOffset = Math.abs(offset)
      const hours = String(Math.floor(absOffset / 60)).padStart(2, '0')
      const minutes = String(absOffset % 60).padStart(2, '0')
      return `${offset <= 0 ? '+' : '-'}${hours}:${minutes}`
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-TimeZone': getTimezoneOffset(),
    }

    if (token) {
      headers['Authorization'] = token
    }

    const projectId = import.meta.env.VITE_AIRIOT_PROJECT_ID || ''
    if (projectId) {
      headers['x-request-project'] = projectId
    }


    // 发送 GET 请求
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`查询失败: ${response.status} ${response.statusText}`)
    }

    // 从响应头获取总记录数（AIRIOT MES 规范）
    const countHeader = response.headers.get('Count')
    const total = countHeader ? parseInt(countHeader, 10) : 0

    const result = await response.json()

    // 转换数据格式 - AIRIOT 直接返回数据数组
    let items: any[] = []

    if (Array.isArray(result)) {
      // 响应直接是数据数组
      items = result
    } else if (result.items && Array.isArray(result.items)) {
      // 包装在对象中
      items = result.items
    }


    return {
      list: items || [],
      total,
      page: params.page,
      size: params.size,
      totalPages: Math.ceil(total / params.size),
    }
  } catch (error: any) {
    throw new Error(error.message || '获取生产订单列表失败')
  }
}

/**
 * 获取生产订单详情
 */
export async function getProductionOrderDetail(id: string): Promise<ProductionOrder> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = mockData.productionOrders.find(item => item.id === id)
        if (order) {
          resolve(order)
        } else {
          reject(new Error('订单不存在'))
        }
      }, 300)
    })
  }

  try {
    const api = createCatalogAPI()
    const result = await api.get(id, { tableId: ORDER_MODEL_ID })
    return result as ProductionOrder
  } catch (error: any) {
    throw new Error(error.message || '获取订单详情失败')
  }
}

/**
 * 创建生产订单
 * 使用 AIRIOT 表记录 API
 * 接口路径：/rest/core/t/{tableId}/d
 */
export async function createProductionOrder(data: any): Promise<ProductionOrder> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOrder: ProductionOrder = {
          id: `order-${Date.now()}`,
          orderNo: data['serial-number-1773'] || `PO${Date.now()}`,
          productCode: data['text-B2EF'] || '',
          productName: data['text-1C5B'] || '',
          orderType: 'batch',
          quantity: data['number-4DE1'] || 0,
          urgency: 3,
          status: (data['done'] as OrderStatus) || '已创建',
          progress: 0,
          deliveryDate: '',
          createdAt: new Date().toISOString(),
        }
        resolve(newOrder)
      }, 500)
    })
  }

  try {
    // 创建专门针对订单表的 API 实例
    const api = createTableRecordAPI(ORDER_MODEL_ID)

    // 调用 save 方法
    const result = await api.save({
      'serial-number-1773': data['serial-number-1773'],
      'text-B2EF': data['text-B2EF'],
      'done': data['done'],
      'text-1C5B': data['text-1C5B'],
      'number-4DE1': data['number-4DE1'],
      'text-7CC5': data['text-7CC5'],
      'text-F185': data['text-F185'],
      'upload-single-AE62': data['upload-single-AE62'],
    })

    return result as ProductionOrder
  } catch (error: any) {
    throw new Error(error.message || '创建订单失败')
  }
}

/**
 * 更新生产订单
 * 使用 AIRIOT 表记录 API
 * 接口路径：/rest/core/t/{tableId}/d
 */
export async function updateProductionOrder(id: string, data: any): Promise<void> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return Promise.resolve()
  }

  try {
    // 创建专门针对订单表的 API 实例
    const api = createTableRecordAPI(ORDER_MODEL_ID)

    // 调用 save 方法更新，partial=true 表示部分更新
    await api.save({
      id,
      'serial-number-1773': data['serial-number-1773'],
      'text-B2EF': data['text-B2EF'],
      'done': data['done'],
      'text-1C5B': data['text-1C5B'],
      'number-4DE1': data['number-4DE1'],
      'text-7CC5': data['text-7CC5'],
      'text-F185': data['text-F185'],
      'upload-single-AE62': data['upload-single-AE62'],
    }, true)  // partial=true
  } catch (error: any) {
    throw new Error(error.message || '更新订单失败')
  }
}

/**
 * 删除生产订单
 */
export async function deleteProductionOrder(id: string): Promise<void> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return Promise.resolve()
  }

  try {
    const api = createCatalogAPI()
    await api.delete(id)
  } catch (error: any) {
    throw new Error(error.message || '删除订单失败')
  }
}

/**
 * 获取生产订单（投产通知单）表的Schema
 * 接口路径：/rest/core/t/schema/投产通知单
 */
export async function getProductionOrderSchema(): Promise<TableSchema> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    // Mock schema - 返回一个基本的schema结构
    return Promise.resolve({
      schema: {
        properties: {
          'serial-number-1773': { type: 'string', title: '订单编号', readonly: [] },
          'text-B2EF': { type: 'string', title: '订单来源' },
          'done': { type: 'string', title: '订单状态', enum: ['订单录入', '调度审核', '排产计划', '生成通知单', '生产中'] },
          'text-1C5B': { type: 'string', title: '产品名称' },
          'number-4DE1': { type: 'number', title: '产品数量' },
          'text-7CC5': { type: 'string', title: '规格型号' },
          'text-F185': { type: 'string', title: '详细参数', field: { multiline: true } },
          'upload-single-AE62': { type: 'any', title: '订单图纸' },
        },
        required: ['text-B2EF', 'text-1C5B', 'number-4DE1'],
      },
      // 定义字段展示顺序
      form: [
        'text-B2EF',           // 订单来源
        'done',                // 订单状态
        'text-1C5B',           // 产品名称
        'number-4DE1',         // 产品数量
        'text-7CC5',           // 规格型号
        'text-F185',           // 详细参数
        'upload-single-AE62',  // 订单图纸
      ]
    })
  }

  try {
    // SDK对core/t/schema路径有特殊处理，需要直接使用fetch请求
    const isDev = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
    const baseURL = isDev ? '' : (import.meta.env.VITE_AIRIOT_API_URL || 'https://demo.airiot.link')
    const url = `${baseURL}/rest/core/t/schema/${encodeURIComponent(ORDER_MODEL_ID)}`


    // 从localStorage获取token
    const token = getToken()

    // 获取时区偏移
    const getTimezoneOffset = () => {
      const offset = (new Date()).getTimezoneOffset()
      const absOffset = Math.abs(offset)
      const hours = String(Math.floor(absOffset / 60)).padStart(2, '0')
      const minutes = String(absOffset % 60).padStart(2, '0')
      return `${offset <= 0 ? '+' : '-'}${hours}:${minutes}`
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-TimeZone': getTimezoneOffset(),
    }

    // 添加认证token
    if (token) {
      headers['Authorization'] = token
    }

    // 添加项目ID
    const projectId = import.meta.env.VITE_AIRIOT_PROJECT_ID || ''
    if (projectId) {
      headers['x-request-project'] = projectId
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`获取Schema失败: ${response.status} ${response.statusText}`)
    }

    const schemaData = await response.json()
    return schemaData
  } catch (error: any) {
    throw new Error(error.message || '获取生产订单Schema失败')
  }
}

/**
 * 根据Schema构建project参数
 * 包含所有Schema字段以及系统必要字段
 */
export function buildProjectFromSchema(schema: TableSchema): Record<string, number> {
  const project: Record<string, number> = {}

  if (!schema) {
    return project
  }

  // 添加系统必要字段
  project['id'] = 1
  project['_id'] = 1
  project['_createTime'] = 1
  project['_updateTime'] = 1
  project['_createUser'] = 1
  project['_updateUser'] = 1

  const schemaFields = schema.schema || schema

  if (!schemaFields || typeof schemaFields !== 'object') {
    return project
  }

    hasProperties: !!schemaFields.properties,
    hasForm: !!schemaFields.form,
    propertiesKeys: schemaFields.properties ? Object.keys(schemaFields.properties) : [],
    formFields: schemaFields.form || []
  })

  // 添加 Schema properties 中定义的所有字段
  if (schemaFields.properties && typeof schemaFields.properties === 'object') {
    const fieldKeys = Object.keys(schemaFields.properties)
    fieldKeys.forEach(field => {
      project[field] = 1
    })
  }

  // 额外检查：form 数组中可能有 properties 中没有的字段
  if (schemaFields.form && Array.isArray(schemaFields.form)) {
    schemaFields.form.forEach((field: string) => {
      if (!project[field]) {
        project[field] = 1
      }
    })
  }

  return project
}
