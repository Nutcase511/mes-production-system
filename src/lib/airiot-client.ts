// AIRIOT 客户端配置 - 使用官方 @airiot/client SDK
import { createAPI, setConfig } from '@airiot/client'

// 导出 createAPI 以便在其他地方使用
export { createAPI, setConfig }

// APIInstance 类型定义
type APIInstance = ReturnType<typeof createAPI>

// API配置
const API_CONFIG = {
  baseURL: import.meta.env.VITE_AIRIOT_API_URL || 'https://demo.airiot.link',
  projectId: import.meta.env.VITE_AIRIOT_PROJECT_ID || '',
  appId: import.meta.env.VITE_AIRIOT_APP_ID || '',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  useMock: import.meta.env.VITE_USE_MOCK_DATA === 'true',
}

/**
 * 初始化AIRIOT客户端配置
 * 在应用启动时调用一次
 */
export function initAiriotClient() {
  // 参考项目的配置方式：不设置 host，依赖 Vite proxy
  // projectId 从环境变量读取
  const projectId = import.meta.env.VITE_AIRIOT_PROJECT_ID || ''

  setConfig({
    projectId,
    language: 'zh-CN',
    // 不设置 host，让请求走 Vite proxy
    // proxy 在 vite.config.ts 中配置：/rest -> https://demo.airiot.link
  })

}

/**
 * 创建Catalog API实例
 * 用于数据表操作
 */
export function createCatalogAPI(): APIInstance {
  return createAPI({
    name: 'core/catalog',
    resource: 'record',
  })
}

/**
 * 创建表记录 API实例
 * 专门用于表记录的新增、修改、删除
 * 接口路径格式：/rest/core/t/{tableId}/d
 * 注意：user 表使用特殊路径 /rest/core/user
 * @param tableId - 表ID，如 '订单录入' 或 'user'
 */
export function createTableRecordAPI(tableId: string): APIInstance {
  // user 表使用特殊的 API 路径
  const isUserTable = tableId.toLowerCase() === 'user'

  return createAPI({
    resource: isUserTable ? 'core/user' : `core/t/${tableId}/d`,
  })
}

/**
 * 创建认证API实例
 */
export function createAuthAPI(): APIInstance {
  return createAPI({
    name: 'core/auth',
    resource: 'user',
  })
}

// 导出配置
export { API_CONFIG }

// 类型导出
export type { APIInstance }
