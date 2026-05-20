'use client'

import { useMemo, useEffect, useState, useRef, useCallback, type ReactNode } from 'react'
import { useDatasetSet } from '@airiot/client'
import { ContextProvider } from '@/components/kesi/container-context-provider/context-provider'

interface ViewDataConfig {
  view?: {
    id?: string
    name?: string
    config?: any
    datasetId?: string
    style?: any
  }
  dimension?: Array<any>
  measure?: Array<any>
  interval?: number
  submit?: string
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

// 视图数据 Hook
function useViewData(config: ViewDataConfig) {
  const {
    view = {},
    dimension = [],
    measure = [],
    interval = 0,
    submit = '',
  } = config

  const viewId = view?.id || ''
  const [dataset, setDataset] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)
  const queryCallback = useRef<(() => void) | null>(null)

  // 获取数据
  const fetchData = useCallback(async () => {
    if (!viewId) {
      return
    }

    setLoading(true)

    try {
      // 使用 @airiot/client 的 API
      const { api } = await import('@airiot/client')

      // 构建查询路径
      const path = `ds/view/preview`

      // 构建 fields - 从 measure 数组映射
      const fields = measure.map((m: any) => ({
        group: m.group,
        isDefaultMeasure: m.isDefaultMeasure,
        isMeasure: m.isMeasure,
        name: m.name || m.id,
        onlyCount: m.onlyCount,
        alias: m.alias,
        option: m.group ? {
          aggregator: m.group
        } : undefined
      }))

      // 构建 config 对象
      const config = {
        noGroupBy: view.config?.noGroupBy ?? false,
        fields,
        where: view.config?.where || [],
        group: dimension.map((d: any) => d.name || d.id),
        groupAlias: dimension.map((d: any) => d.alias || ''),
        echartType: view.config?.echartType || 'line',
        stack: view.config?.stack || null
      }

      // 构建完整的请求体
      const requestBody = {
        config,
        datasetId: view.datasetId,
        name: view.name,
        style: view.style
      }

      // 构建查询字符串
      const params = new URLSearchParams({ id: viewId, mode: 'live' })
      const fullPath = `${path}?${params.toString()}`

      // 调用 API
      const apiRet = api({
        name: fullPath,
      })

      const response = await apiRet.fetch('', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      const responseData = response.json

      // 处理数据 - 转换为图表格式
      const processedData = filterResult(responseData)
      setDataset(processedData)
      setRequestId(`${Date.now()}-${Math.random().toString(36).substring(2, 11)}`)
    } catch (error) {
      setDataset(null)
      setRequestId(`${Date.now()}-${Math.random().toString(36).substring(2, 11)}`)
    } finally {
      setLoading(false)
    }
  }, [viewId, view, dimension, measure])

  // 保存到 ref
  queryCallback.current = fetchData

  // 初始加载
  useEffect(() => {
    queryCallback.current?.()
  }, [])

  // submit 变化时手动触发
  const prevSubmitRef = useRef<string>(null)

  useEffect(() => {
    if (submit && submit !== prevSubmitRef.current) {
      prevSubmitRef.current = submit
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

  return { dataset, loading, fetchData, requestId }
}

export interface DatasourceViewProps {
  id?: string
  view?: {
    id?: string
    name?: string
    config?: any
    datasetId?: string
    style?: any
  }
  dimension?: Array<{ id?: string; name?: string }>
  measure?: Array<any>
  interval?: number
  submit?: string
  children?: ReactNode
}

export function DatasourceView({
  id = 'datasource-view',
  view = {},
  dimension = [],
  measure = [],
  interval = 0,
  submit,
  children
}: DatasourceViewProps) {
  const datasetSet = useDatasetSet(id)

  // 使用视图数据
  const { dataset, loading, requestId } = useViewData({
    view,
    dimension,
    measure,
    interval,
    submit
  })

  // 数据变化时：更新 atom
  useEffect(() => {
    datasetSet({ data: dataset, loading })
  }, [requestId, loading, datasetSet])

  // 准备 context 数据
  const contextData = useMemo(() => {
    return [{
      data: dataset,
      loading
    }]
  }, [requestId, loading])

  return (
    <ContextProvider data={contextData}>
      {children}
    </ContextProvider>
  )
}

