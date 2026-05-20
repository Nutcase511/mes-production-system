'use client'

import { useMemo, useEffect, useState, useCallback, type ReactNode } from 'react'
import isNumber from 'lodash/isNumber'
import isNil from 'lodash/isNil'
import isPlainObject from 'lodash/isPlainObject'
import cloneDeep from 'lodash/cloneDeep'
import { api, useWS } from '@airiot/client'
import { useDatasetSet } from '@airiot/client'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import { ContextProvider } from '@/components/kesi/container-context-provider/context-provider'
import type {
  TagValue,
  TagConfig,
  TimeLineConfig,
  DataPoint,
  Dimension,
  QueryResult,
  WSMessageData,
  UseWSReturn
} from '@/lib/datasource-types'

// ==================== Types ====================

/**
 * 实时数据配置
 */
export interface RealtimeDataConfig {
  tags?: TagConfig[]
  timeLine?: TimeLineConfig
  xFormat?: string
  submit?: string
}

export interface DatasourceRealtimeProps {
  id?: string
  tags?: TagConfig[]
  timeLine?: TimeLineConfig
  xFormat?: string
  interval?: number
  submit?: string
  children?: ReactNode
}

// 重新导出类型，方便外部使用
export type { TagValue, TagConfig, TimeLineConfig, DataPoint, Dimension, QueryResult, WSMessageData, UseWSReturn }

// 默认配置
export const defaultRealtimeConfig: RealtimeDataConfig = {
  tags: [{
    tableData: { id: '6912cc842e0f29806c78bce5', table: { id: 'A' } },
    tag: { id: 'a', name: '测试a' }
  }],
  timeLine: { count: 5, unit: 'm' },
  xFormat: 'YYYY-MM-DD HH:mm:ss',
  submit: ''
}

// ==================== Utility Functions ====================

/**
 * 数字保留指定小数位
 */
const toFixed = (value: number, precision: number = 2): number | null => {
  if (!isNumber(value)) {
    return value
  }
  return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision)
}

/**
 * 构建标签的唯一键
 */
const buildTagKey = (tagId: string | undefined, tableDataId: string | undefined): string => {
  if (!tagId || !tableDataId) return 'unknown'
  return `${tableDataId}-${tagId}`
}

/**
 * 获取历史数据
 */
const fetchHistoryData = async (where: string): Promise<Record<string, any[]>> => {
  try {
    const { json: { results } } = await api({ name: 'core/data' })
      .fetch('/query', {
        method: 'POST',
        body: where
      })

    if (!results || results.length === 0) {
      return {}
    }

    const data: Record<string, any[]> = {}

    results.forEach((item: any) => {
      if (item?.series) {
        const point = item.series[0]
        if (point?.values) {
          const tagId = point.columns?.[1]
          const tableDataId = point.values?.[0]?.[2]
          const key = buildTagKey(tagId, tableDataId)
          data[key] = point.values.slice().reverse().map((v: any) => [
            new Date(v[0]),
            v[1],
            v[2]
          ])
        }
      }
    })

    return data
  } catch (err: any) {
    const errorMessage = err.json?.data || err.message || err?.json?.detail || err?.detail || '获取历史数据失败'
    toast.error(errorMessage)
    throw err
  }
}

/**
 * 按 tags 顺序排序数据集
 */
const sortByTags = (
  dataset: QueryResult[],
  tags: TagConfig[]
): QueryResult[] => {
  if (!Array.isArray(dataset) || dataset.length === 0) {
    return []
  }

  if (!Array.isArray(tags) || tags.length === 0) {
    return dataset.slice()
  }

  const tagOrderMap = new Map<string, number>()

  tags.forEach((tag, index) => {
    if (!tag) return

    const tableData = tag.tableData
    const tagValue = tag.tag

    if (!tableData?.id || !tagValue?.id) {
      return
    }

    const key = buildTagKey(tagValue.id, tableData.id)
    tagOrderMap.set(key, index)
  })

  return dataset.slice().sort((a, b) => {
    const aOrder = a.key !== undefined ? tagOrderMap.get(a.key) ?? Infinity : Infinity
    const bOrder = b.key !== undefined ? tagOrderMap.get(b.key) ?? Infinity : Infinity
    return aOrder - bOrder
  })
}

/**
 * 格式化时间
 */
const formatTime = (time: Date | string, xFormat?: string): Date | string => {
  return xFormat ? dayjs(time).format(xFormat) : new Date(time)
}

/**
 * 查找标签名称
 */
const findTagName = (tags: TagConfig[], key: string): string => {
  const tag = tags.find(t => {
    const tagId = t.tag?.id || t.id
    const tableDataId = t.tableData?.id
    const tagKey = buildTagKey(tagId, tableDataId)
    return tagKey === key
  })

  if (!tag) return ''

  // 返回标题或组合名称
  return tag.title ||
    tag.name ||
    `${tag.tableData?.name || ''}-${tag.tag?.name || ''}`
}

/**
 * 获取标签项
 */
const getTagItem = (tags: TagConfig[], key: string): TagConfig | undefined => {
  return tags.find(d => {
    const tagId = d.tag?.id || d.id
    const tableDataId = d.tableData?.id
    const tagKey = buildTagKey(tagId, tableDataId)
    return tagKey === key
  })
}

// ==================== Main Hook ====================

/**
 * 实时数据 Hook
 */
function useRealtimeData(config: RealtimeDataConfig) {
  const {
    tags = [],
    timeLine = { count: 1, unit: 'h' },
    xFormat,
    submit,
  } = config

  const [dataset, setDataset] = useState<QueryResult[]>([])
  const [loading, setLoading] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)

  // 使用 WebSocket（在顶层调用 hook）
  const { subscribe, onData } = useWS()

  /**
   * 处理标签数据
   * 只支持标准格式：tableData 和 tag
   */
  const processTags = useCallback((inputTags: TagConfig[]) => {
    return (inputTags || [])
      .filter(t => t?.tag?.id && t?.tableData?.id) as TagConfig[]
  }, [])

  const subTags = useMemo(() => processTags(tags), [tags, processTags])

  /**
   * 获取历史数据
   */
  const fetchHistory = useCallback(async () => {
    if (subTags.length === 0) {
      setDataset([])
      return
    }

    const isLastPoint = !(timeLine?.count)
    const timeWhere = isLastPoint
      ? []
      : [`time >= now() - ${timeLine.count || 1}${timeLine.unit || 'h'}`]

    const where = subTags
      .map(s => {
        // 获取标签ID
        const tagId = s?.tag?.id || s?.id

        // 获取表ID
        const tableId = s?.table?.id || s?.tableData?.table?.id

        // 获取表数据ID
        const tableDataId = s?.tableData?.id

        if (!tableId || !tableDataId || !tagId) {
          return null
        }

        return {
          fields: [isLastPoint ? `LAST("${tagId}") AS "${tagId}"` : `"${tagId}"`, 'id'],
          order: 'time desc',
          id: tableDataId,
          tableId: tableId,
          where: timeWhere
        }
      })
      .filter(Boolean)

    if (where.length === 0) {
      setDataset([])
      return
    }

    try {
      setLoading(true)

      const data = await fetchHistoryData(JSON.stringify(where))

      // 确保所有标签都有数据
      where.forEach(item => {
        if (!item || !item.fields || !item.fields[0]) return
        const key = buildTagKey(item.id, item.fields[0].split('"')[1])
        if (!data[key]) {
          data[key] = []
        }
      })

      let result: QueryResult[]

      if (isLastPoint) {
        // 获取最新数据点
        const dimensions: Dimension[] = [
          { name: 'time', title: '时间', type: xFormat ? 'ordinal' : 'time' },
          { name: 'value', title: '数据值', type: 'number' },
          { name: 'name', title: '名称', type: 'ordinal' },
          { name: 'key', title: '标识', type: 'ordinal' }
        ]

        const source = Object.keys(data).map(key => {
          const item = getTagItem(subTags, key)
          const name = findTagName(subTags, key)
          const tag = item?.tag
          const itemKey = buildTagKey(
            tag?.id || item?.tableData?.id,
            tag?.id || item?.id
          )
          const value = data[key].length > 0
            ? toFixed(data[key][0][1], !isNil(item?.fixed) ? item?.fixed : 3)
            : null
          const time = data?.[key]?.[0]?.[0] || null

          return [
            formatTime(time, xFormat),
            value,
            name,
            itemKey
          ]
        })

        result = [{ dimensions, source }]
      } else {
        // 获取历史数据序列
        result = Object.keys(data).map(key => {
          const item = getTagItem(subTags, key)
          const tag = item?.tag
          const node = item?.tableData
          const name = item?.title ||
            `${node?.name || node?.title || node?.id || ''}-${tag?.name || item?.name || key}`

          return {
            key,
            title: name,
            dimensions: [
              { name: 'time', title: '时间', type: xFormat ? 'ordinal' : 'time' },
              { name: name || key, type: 'number', tag: key }
            ],
            source: data[key].map(d => [
              formatTime(d[0], xFormat),
              toFixed(d[1], !isNil(item?.fixed) ? item?.fixed : 3),
              d[2]
            ])
          }
        })
      }

      setDataset(sortByTags(result, subTags))
      setRequestId(`${Date.now()}-${Math.random().toString(36).substring(2, 11)}`)
    } catch (err) {
      setDataset([])
      setRequestId(`${Date.now()}-${Math.random().toString(36).substring(2, 11)}`)
    } finally {
      setLoading(false)
    }
  }, [subTags, timeLine, xFormat])

  /**
   * 处理 WebSocket 数据更新
   */
  const handleWsData = useCallback((data: any) => {
    if (subTags.length === 0) return

    const payload: Array<{ key: string; value: number; time: Date | string }> = []

    if (data && isPlainObject(data)) {
      const tableDataId = data.tableDataId || data.id
      const fields = data.fields
      const time = new Date(data?.time || Date.now())

      Object.keys(fields).forEach(tagId => {
        const key = buildTagKey(tagId, tableDataId)
        const value = fields[tagId]
        payload.push({
          key,
          value,
          time: formatTime(time, xFormat)
        })
      })
    }

    setDataset(prevDataset => {
      if (!prevDataset || prevDataset.length === 0) {
        return prevDataset
      }

      // 只处理数组格式（实时数据总是返回数组）
      const newDataset = prevDataset.map(d => {
        let newD = { ...d }
        payload.forEach(p => {
          if (p.key === d.key || !d.key) {
            const source = cloneDeep(d.source || []) as any[][]
            if (source.length > 0) {
              source.shift()
              source.push([p.time, p.value, findTagName(subTags, p.key), p.key])
            }
            newD = { ...newD, source }
          }
        })
        return newD
      })

      return sortByTags(newDataset, subTags)
    })
  }, [subTags, xFormat])

  // 初始加载
  useEffect(() => {
    fetchHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 提交时重新获取历史数据
  useEffect(() => {
    if (submit) {
      fetchHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submit])

  /**
   * 订阅实时数据更新
   */
  useEffect(() => {
    if (subTags.length === 0) return

    // 构建订阅标签
    const subTagList = subTags.map(t => {
      return {
        tagId: t.tag?.id || t.id,
        tableId: t.table?.id || t.tableData?.table?.id,
        dataId: t.tableData?.id
      }
    }).filter(item => item?.tagId && item?.tableId && item?.dataId)

    if (subTagList.length === 0) return

    // 注册数据回调
    onData(handleWsData)

    // 订阅实时数据
    const unsubscribe = subscribe('data', subTagList)

    // 返回清理函数
    return () => {
      unsubscribe?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTags])

  return {
    dataset,
    loading,
    fetchData: fetchHistory,
    requestId
  }
}

export function DatasourceRealtime({
  id = 'datasource-realtime',
  tags = [],
  timeLine = { count: 5, unit: 'm' },
  xFormat = 'YYYY-MM-DD HH:mm:ss',
  submit,
  children
}: DatasourceRealtimeProps) {
  const datasetSet = useDatasetSet(id)

  // 使用实时数据
  const { dataset, loading, requestId } = useRealtimeData({
    tags,
    timeLine,
    xFormat,
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
