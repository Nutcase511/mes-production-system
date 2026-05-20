'use client'

import { ReactNode, useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { useDatasetSet } from '@airiot/client'
import { ContextProvider } from '@/components/kesi/container-context-provider/context-provider'

// ==================== Types ====================

export interface DatasourceApiProps {
  id?: string
  url?: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Array<{ name: string; value: string }>
  body?: Array<{ name: string; value: string }>
  predata?: boolean
  table?: any
  appkey?: string
  appsecret?: string
  interval?: number
  submit?: string
  children?: ReactNode
}

export interface ApiDataConfig {
  url?: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Array<{ name: string; value: string }>
  body?: Array<{ name: string; value: string }>
  predata?: boolean
  interval?: number
  table?: any
  appkey?: string
  appsecret?: string
  submit?: string
}

// 默认配置（包含示例数据用于调试）
export const defaultApiConfig: ApiDataConfig = {
  url: 'core/t/{table}/d',
  method: 'GET',
  headers: [],
  body: [],
  predata: false,
  interval: 0,
  table: {
    id: '子',
    title: '子表'
  },
  appkey: undefined,
  appsecret: undefined,
  submit: ''
}

// ==================== Utility Functions ====================

// 对象转 URL 参数
function objToUrlParams(obj: Record<string, any>, url: string): string {
  try {
    if (!url || typeof url !== 'string') {
      return ''
    }
    let params = ''
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (Array.isArray(obj[key])) {
          let arrayParams = ''
          for (let i = 0; i < obj[key].length; i++) {
            arrayParams += `${key}=${obj[key][i].toString()}&`
          }
          params += arrayParams.slice(0, -1) // remove last "&"
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          const nestedParams = objToUrlParams(obj[key], url)
          params += `${key}=${nestedParams}&`
        } else {
          params += `${key}=${obj[key].toString()}&`
        }
      }
    }
    params = params.slice(0, -1) // remove last "&"
    const separator = url.includes('?') ? '&' : '?'
    return url + separator + params
  } catch {
    return ''
  }
}

// 数组转键值对
function arrayToKv(arr: Array<{ name: string; value: any }>): Record<string, any> {
  const kv: Record<string, any> = {}
  if (arr?.length) {
    arr.forEach(item => {
      if (item && !isEmpty(item)) {
        kv[item.name] = item.value
      }
    })
  }
  return kv
}

function isEmpty(obj: any): boolean {
  if (obj == null) return true
  if (Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

// 检查是否是 HTTP(S) URL
function checkHttp(url: string): boolean {
  if (!url) return false
  const regex = /^(https?:\/\/)/i
  return regex.test(url)
}

// 过滤结果为图表格式
function filterResult(json: any): { dimensions: any[]; source: any[] } {
  let _json = json
  let dimensions: any[] = []
  let source: any[] = []

  try {
    if (typeof _json === 'object' && !Array.isArray(_json)) {
      _json = [_json]
    } else if (!Array.isArray(_json)) {
      _json = [{ result: _json }]
    }

    _json.forEach((item: any) => {
      const keys = Object.keys(item)
      dimensions = [...new Set([...dimensions, ...keys])]
    })

    _json.forEach((item: any) => {
      const values: any[] = []
      dimensions.forEach(key => {
        values.push(item[key])
      })
      source.push(values)
    })
  } catch (err) {
  }

  return { dimensions, source }
}

// ==================== Hook ====================

// API 数据 Hook
function useApiData(config: ApiDataConfig) {
  const {
    url = '',
    method = 'GET',
    headers = [],
    body = [],
    predata = false,
    interval = 0,
    table,
    appkey,
    appsecret,
    submit = '',
  } = config

  const [dataset, setDataset] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)
  const queryCallback = useRef<(() => void) | null>(null)

  // 过滤数据
  const filterData = useCallback((data: any) => {
    if (predata) {
      return filterResult(data)
    }
    return data
  }, [predata])

  // 获取数据
  const fetchData = useCallback(async () => {
    if (!url) {
      return
    }

    setLoading(true)

    try {
      let responseData: any

      // 判断 URL 类型
      const isHttpUrl = checkHttp(url)
      const hasTablePlaceholder = url.includes('{table}')
      const hasAuthPlaceholder = url.includes('{appkey}') || url.includes('{appsecret}')

      if (isHttpUrl) {
        // 情况 4: HTTP(S) 外部接口 - 无需其他参数
        const requestOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...arrayToKv(headers)
          }
        }

        if (method !== 'GET' && body.length > 0) {
          requestOptions.body = JSON.stringify(arrayToKv(body))
        }

        const requestUrl = method === 'GET' && body.length > 0
          ? objToUrlParams(arrayToKv(body), url)
          : url

        const response = await fetch(requestUrl, requestOptions)
        responseData = await response.json()
      } else {
        // 内部 API 调用 (使用 @airiot/client)
        const { api } = await import('@airiot/client')

        let path = url

        // 情况 1: 包含 {table} 占位符 - 需要配置 table 参数
        if (hasTablePlaceholder) {
          if (!table?.id) {
            setLoading(false)
            return
          }
          path = url.replace('{table}', table.id)
        }

        // 情况 3: 包含认证占位符 - 需要配置 appkey 和 appsecret
        if (hasAuthPlaceholder) {
          if (!appkey || !appsecret) {
            setLoading(false)
            return
          }
          path = url
            .replace('{appkey}', appkey)
            .replace('{appsecret}', appsecret)
        }

        // 情况 2: 普通内部路径 (如 'core/systemVariable') - 无需其他参数
        // 直接使用原始 URL

        // 添加查询参数（GET 请求）
        if (method === 'GET' && body.length > 0) {
          path = objToUrlParams(arrayToKv(body), path)
        }

        // 使用 @airiot/client 的 API
        const bodyStr = method !== 'GET' && body.length > 0 ? JSON.stringify(arrayToKv(body)) : undefined

        const apiRet = api({
          name: path,
        })

        const response = await apiRet.fetch('', {
          method,
          headers: arrayToKv(headers),
          body: bodyStr,
        })
        responseData = response.json
      }

      // 处理数据
      const processedData = filterData(responseData)
      setDataset(processedData)
      setRequestId(`${Date.now()}-${Math.random().toString(36).substring(2, 11)}`)
    } catch (error) {
      setDataset(null)
    } finally {
      setLoading(false)
    }
  }, [url, method, headers, body, predata, table, appkey, appsecret, filterData])

  // 保存到 ref
  queryCallback.current = fetchData

  // 初始加载
  useEffect(() => {
    queryCallback.current?.()
  }, [])

  // submit 变化时触发查询
  useEffect(() => {
    if (submit) {
      queryCallback.current?.()
    }
  }, [submit])

  // 自动轮询
  useEffect(() => {
    if (!interval || interval <= 0) return

    const tick = () => {
      queryCallback.current?.()
    }

    const id = setInterval(tick, interval * 1000)
    return () => clearInterval(id)
  }, [interval])

  return { dataset, loading, requestId, fetchData }
}

// ==================== Component ====================

/**
 * API 数据源组件 - 纯容器，不包含任何布局和样式
 * 内部集成 ContextProvider，子组件通过 useContextProvider 获取数据
 * 优化：只在查询参数变化时更新数据，避免大数据集的不必要比较
 */
export function DatasourceApi({
  id = 'datasource-api',
  url = '',
  method = 'GET',
  headers = [],
  body = [],
  predata = false,
  table,
  appkey,
  appsecret,
  interval = 0,
  submit,
  children
}: DatasourceApiProps) {
  // 使用 API 数据
  const { dataset, loading, requestId } = useApiData({
    url,
    method,
    headers,
    body,
    predata,
    table,
    appkey,
    appsecret,
    interval,
    submit
  })

  // 使用 useDatasetSet 将数据存储到 jotai atom
  const setDataset = useDatasetSet(id)

  // 只监听 requestId 和 loading，更新 jotai atom
  useEffect(() => {
    setDataset({ data: dataset, loading })
  }, [requestId, loading, setDataset])

  // 构造 ContextProvider 的 data
  const contextData = useMemo(() => {
    return [{ data: dataset, loading }]
  }, [requestId, loading])

  // 使用 ContextProvider 包裹子组件
  return (
    <ContextProvider data={contextData}>
      {children}
    </ContextProvider>
  )
}
