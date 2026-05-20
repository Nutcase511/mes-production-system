'use client'

import { ReactNode, useEffect, useMemo, useState, useRef, useCallback } from 'react'
import isNumber from 'lodash/isNumber'
import isEmpty from 'lodash/isEmpty'
import isNil from 'lodash/isNil'
import keys from 'lodash/keys'
import isNull from 'lodash/isNull'
import cloneDeep from 'lodash/cloneDeep'
import last from 'lodash/last'
import slice from 'lodash/slice'
import { api } from '@airiot/client'
import { useDatasetSet } from '@airiot/client'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import { ContextProvider } from '@/components/kesi/container-context-provider/context-provider'
import { timeQuery } from '@/lib/datasource-utils'
import type {
  TimeRangeConfig,
  GroupConfig,
  DataItemConfig,
  ColumnConfig,
  QueryResult
} from '@/lib/datasource-types'

// ==================== Types ====================

/**
 * 历史数据查询配置
 */
export interface HistoryDataConfig {
  timeRange?: TimeRangeConfig
  group?: GroupConfig
  tags?: Array<DataItemConfig & { func?: string; fixed?: number; title?: string; query?: any }>
  columns?: ColumnConfig[]
  emptyDataFilter?: boolean
  noTime?: boolean
  interval?: number
  xFormat?: string
  statisType?: string
  type?: string
  startTime?: any
  sortByTime?: boolean
  submit?: string
}

export interface DatasourceHistoryProps {
  id?: string
  timeRange?: TimeRangeConfig
  group?: GroupConfig
  tags?: Array<any>
  columns?: Array<any>
  interval?: number
  xFormat?: string
  submit?: string
  children?: ReactNode
}

// 默认配置（包含示例数据用于调试）
export const defaultHistoryConfig: HistoryDataConfig = {
  timeRange: {
    type: 'forward',
    range: {
      gte: '2026-01-28 17:08:54',
      lte: '2026-01-31 17:08:58'
    },
    unit: 'd',
    count: 1,
    fromNow: true
  },
  group: {
    count: 0,
    unit: '',
    fill: { value: 'null' }
  },
  tags: [],
  columns: [{
    table: {
      id: 'A',
      name: 'A',
      tableMajorType: 'device'
    },
    tableData: {
      id: 'A001',
      name: 'A001',
      table: {
        id: 'A',
        name: 'A',
        tableMajorType: 'device'
      }
    },
    field: 'COUNT("a")'
  }],
  emptyDataFilter: false,
  noTime: false,
  interval: 0,
  xFormat: 'YYYY-MM-DD HH:mm:ss',
  statisType: undefined,
  type: undefined,
  startTime: undefined,
  sortByTime: false,
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
 * 转换字段表达式
 */
const convertField = (params: {
  field?: string
  groupType?: string
  method?: string
}): string => {
  const { field, groupType, method } = params

  if (field == null) {
    return 'MEAN(NULL)'
  }

  if (field.indexOf('(') < 0) {
    return `${groupType && method ? method : 'MEAN'}(${field})`
  }

  return field
}

/**
 * 检查是否有分组
 */
const hasGroup = (group?: GroupConfig): boolean => {
  return !!(group && group.count && group.unit)
}

/**
 * 查找对象中最长的数组属性
 */
const findLongestArrayProperty = (obj: Record<string, any[]>): string | null => {
  let longestProp: string | null = null
  let maxLength = 0

  for (const prop in obj) {
    if (Array.isArray(obj[prop]) && obj[prop].length > maxLength) {
      maxLength = obj[prop].length
      longestProp = prop
    }
  }

  return longestProp
}

/**
 * 合并序列数据（按ID）
 */
const mergeSeriesById = (series: any[]): any[] => {
  if (series?.length > 1) {
    const resultValues = series[0].values.map((item: any) => [item[0], 0])
    series.forEach((serie) => {
      const { values } = serie
      values.forEach((value: any, index: number) => {
        resultValues[index][1] = resultValues[index][1] + value[1]
      })
    })
    return [{ values: resultValues }]
  }
  return series
}

/**
 * 获取时间范围
 */
const getTimeRange = async (timeRange: TimeRangeConfig): Promise<TimeRangeConfig> => {
  const range = timeRange?.range

  if (range?.radioType === 2) {
    const date = range.date
    const record = range.record
    const tableId = record?.table?.id
    const recordId = record?.id

    if (!date || !recordId) {
      let messageTip = ''
      if (!date) {
        messageTip += '未指定班次日期,'
      }
      if (!recordId) {
        messageTip += '未指定班次记录'
      }
      toast.warning(messageTip)
      return Promise.reject(new Error(messageTip))
    }

    try {
      const res = await api({ name: `core/t/${tableId}/d` }).get(recordId)
      const startTime = res.startTime
      const endTime = res.endTime
      const startCycle = res.startCycle // before, now, after
      const endCycle = res.endCycle // now, next

      // 根据startCycle调整gte的日期
      let gteDate = dayjs(date, 'YYYY-MM-DD')
      if (startCycle === 'before') {
        gteDate = gteDate.subtract(1, 'day')
      } else if (startCycle === 'after') {
        gteDate = gteDate.add(1, 'day')
      }

      // 根据gteDate和endCycle计算lte的日期
      let lteDate = gteDate
      if (endCycle === 'next') {
        lteDate = lteDate.add(1, 'day')
      }

      return {
        ...timeRange,
        range: {
          gte: gteDate.format('YYYY-MM-DD') + ' ' + startTime,
          lte: lteDate.format('YYYY-MM-DD') + ' ' + endTime
        }
      }
    } catch (error) {
      toast.error('获取班次记录失败')
      return Promise.reject(error)
    }
  }

  return timeRange
}

/**
 * 构建查询对象
 */
const makeQuery = (
  item: DataItemConfig,
  range: TimeRangeConfig,
  noTime?: boolean,
  group?: GroupConfig,
  statisType?: string,
  type?: string,
  startTime?: any,
  getOtherCondition?: (query: any) => any,
  sortByTime?: boolean
): any | null => {
  const timeWhere = timeQuery(range)

  if (!timeWhere) {
    return null
  }

  const query: any = {
    fields: item.fields,
    id: item.id,
    tableId: item?.table || item?.model?.id,
    where: [...timeWhere],
    order: sortByTime ? 'time desc' : 'time asc',
    otherCondition: item.id && item.query?.length && item.query[0]?.length && item.query[0][0]?.field && item.query[0][0]?.method ? getOtherCondition?.(item.query) : null,
    fill: null
  }

  if (!noTime) {
    // 检查是否是班次分组
    const isClassGroup = group && group.isClassMode

    if (isClassGroup) {
      // 班次分组特殊处理
      query.type = 'class'
      query.bcTable = group.table
      query.bcTableData = group.record
    } else {
      // 普通时间分组处理
      let groupQuery = group && group.count && group.unit ? `time(${group.count}${group.unit})` : ''

      // 特殊处理财务月分组
      if (group && group.unit === 'fm') {
        groupQuery = `time(${group.count}m)`
        // TODO: 财务月配置需要从外部传入
        // const statisticsPeriodConfig = app?.context?.settings?.statisticsPeriodConfig || {}
        query.type = 'month'
        // query.startTime = {
        //   day: statisticsPeriodConfig?.financialMonth?.date,
        //   hms: statisticsPeriodConfig?.financialMonth?.time
        // }
      }

      if (item.groupType === 'id') {
        query.group = ['id']
      } else if (item.groupType === 'department') {
        query.group = ['department']
      } else if (item.groupType === 'other') {
        query.group = [`"${item.group}"`]
      }

      if (groupQuery) {
        query.group = [...(query.group || []), groupQuery]
        query.fill = group?.fill?.value || 'null'
      }
    }
  }

  if (statisType && statisType === 'moment' && type && !isEmpty(startTime)) {
    query.type = type
    query.startTime = startTime
  }

  return query
}

/**
 * 执行数据查询
 */
const queryData = async (
  items: DataItemConfig[],
  timeRange: TimeRangeConfig,
  group?: GroupConfig,
  noTime?: boolean,
  xFormat?: string,
  statisType?: string,
  type?: string,
  startTime?: any,
  getOtherCondition?: (query: any) => any,
  sortByTime?: boolean
): Promise<QueryResult | QueryResult[] | undefined> => {
  try {
    const filterItems = items.filter(
      f => f?.uid || f?.id || (f?.table && (group && group.count && group.unit || f.groupType))
    )

    const queries = filterItems.map(item =>
      makeQuery(item, timeRange, noTime, group, statisType, type, startTime, getOtherCondition, sortByTime)
    ).filter(Boolean)

    if (queries.length === 0) {
      return undefined
    }

    const queryStr = encodeURIComponent(JSON.stringify(queries))
    const { results } = await api({ name: 'core/data' }).fetch('/query?query=' + queryStr).then(({ json }) => json)

    if (!results) {
      return undefined
    }

    const hasGroupFlag = hasGroup(group)

    const series = items.reduce((prev: Record<string, any>, item: DataItemConfig, index: number) => {
      const result = results[index]
      const { key, fixed, groupType } = item
      const itemGroup = item.group

      // 如果未选资产且按时间分组
      if (result?.series && hasGroupFlag && !item.uid && !item.id && !groupType) {
        result.series = mergeSeriesById(result.series)
      }

      if (groupType) {
        if (group && group.count && group.unit) {
          const newseries: any[] = []
          result.series.forEach((item: any) => {
            const col1 = item?.tags?.[groupType || ''] || item?.tags?.[itemGroup || '']
            item?.values.forEach((vs: any) => {
              const col2 = xFormat ? dayjs(new Date(vs[0])).format(xFormat) : new Date(vs[0])
              const col3 = toFixed(vs[1], !isNil(fixed) ? fixed : 3)
              newseries.push([col1, col2, col3])
            })
          })
          prev[key!] = newseries
        } else {
          prev[key!] = result.series.map((item: any) => {
            return [
              item?.tags?.[groupType || ''] || item?.tags?.[itemGroup || ''],
              toFixed(item?.values?.[0]?.[1], !isNil(fixed) ? fixed : 3)
            ]
          })
        }
      } else {
        prev[key!] = (result && result.series)
          ? result.series[0]?.values.map((vs: any) => {
            if (xFormat) {
              return [dayjs(new Date(vs[0])).format(xFormat), toFixed(vs[1], !isNil(fixed) ? fixed : 3)]
            } else {
              return [new Date(vs[0]), toFixed(vs[1], !isNil(fixed) ? fixed : 3)]
            }
          })
          : []
      }

      return prev
    }, {})

    if (noTime) {
      // 统计数据
      const source = keys(series).map(key => {
        const item = items.find(i => i.key === key)
        if (series[key] && series[key].length > 0) {
          return [item?.title || item?.name, !isNil(series[key][0][1]) ? series[key][0][1] : null, key]
        } else {
          return null
        }
      }).filter(Boolean)

      return {
        dimensions: [
          { name: 'name', title: '数据项', type: 'ordinal' },
          { name: 'value', title: '数据值', type: 'number' },
          { name: 'key', title: '数据ID', type: 'ordinal' }
        ],
        source: source as any[]
      }
    } else if (hasGroupFlag && !items.find(item => item.groupType)) {
      const maxLen = findLongestArrayProperty(series)
      if (!maxLen) return undefined
      const times = series[maxLen]?.map((s: any) => s[0])
      const source = times?.map((t: any, i: number) => {
        return [
          t,
          ...keys(series).map(key => {
            if (series[key]) {
              const val = !isNil(series[key][i]) ? series[key][i][1] : null
              return val == null || val == undefined ? null : val
            } else {
              return null
            }
          })
        ]
      })

      if (xFormat) {
        return {
          dimensions: [
            { name: 'time', title: '时间', type: 'ordinal' },
            ...keys(series).map(key => {
              const item = items.find(i => i.key === key)
              return { name: item?.title || item?.name || key || '', type: 'number' as const, tag: item?.key }
            })
          ],
          source
        } as QueryResult
      } else {
        return {
          dimensions: [
            { name: 'time', title: '时间', type: 'time' },
            ...keys(series).map(key => {
              const item = items.find(i => i.key === key)
              return { name: item?.title || item?.name || key || '', type: 'number' as const, tag: item?.key }
            })
          ],
          source
        } as QueryResult
      }
    } else {
      // 返回多个dataset
      return keys(series).map(key => {
        const item = items.find(i => i.key === key)
        const title = item?.name
        const dimensions: Array<{ name: string; title?: string; type: string; tag?: string }> = [
          { name: item?.title || item?.name || key || '', type: 'number', tag: item?.key }
        ]
        const source = series[key]

        const finalDimensions = [...dimensions]

        if (item?.groupType) {
          if (hasGroupFlag) {
            finalDimensions.unshift({ name: 'time', title: '时间', type: xFormat ? 'ordinal' : 'time' })
          }

          let d1: { name: string; title: string; type: string } = { name: item.group || '', title: item.group || '', type: 'string' }
          if (item.groupType === 'id') {
            d1 = { name: 'id', title: '设备编号', type: 'string' }
          } else if (item.groupType === 'department') {
            d1 = { name: 'department', title: '部门', type: 'string' }
          }
          finalDimensions.unshift(d1)
        } else {
          finalDimensions.unshift({ name: 'time', title: '时间', type: xFormat ? 'ordinal' : 'time' })
        }

        return { title, dimensions: finalDimensions, source } as QueryResult
      })
    }
  } catch (err) {
    toast.error('数据查询出现错误，请检查数据')
    return undefined
  }
}

/**
 * 历史数据查询 Hook
 */
function useHistoryData(config: HistoryDataConfig) {
  const {
    timeRange,
    group,
    tags,
    columns,
    emptyDataFilter,
    noTime,
    interval,
    xFormat,
    statisType,
    type,
    startTime,
    sortByTime,
    submit,
  } = config

  const [dataset, setDataset] = useState<QueryResult | QueryResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)
  const queryCallback = useRef<(() => void) | null>(null)

  // 暂时空实现，后续可以传入实际的 getOtherCondition 方法
  const getOtherCondition = useCallback(() => {
    return null
  }, [])

  // 查询数据
  const queryDataHandler = useCallback(async () => {
    try {
      // 构建查询项
      const itemsWithNull = [
        // 处理 tags
        ...(tags || []).map(item => {
          // 获取标签信息
          let tagId: string | undefined
          let tagName: string | undefined
          let tableDataId: string | undefined
          let tableId: string | undefined

          // 形式 2: tag 包含 tableData
          if (item.tag?.tableData) {
            tagId = item.tag.id
            tagName = item.tag.name
            tableDataId = item.tag.tableData.id
            tableId = item.tag.tableData.table?.id
          }
          // 形式 1: tableData 和 tag 分别配置
          else if (item.tableData && item.tag) {
            tagId = item.tag.id
            tagName = item.tag.name
            tableDataId = item.tableData.id
            tableId = item.table?.id || item.tableData?.table?.id
          }
          // 向后兼容：tableDataTag 格式
          else if (item.tableDataTag?.value) {
            tagId = item.tableDataTag.value.tagId
            tableDataId = item.tableDataTag.value.tableDataId
            tableId = item.tableDataTag.value.tableId
            tagName = item.tableDataTag.name
          }

          if (!tagId) return null

          const tagField = (hasGroup(group) || noTime) ? (`${item.func || 'mean'}("${tagId}")`) : tagId

          return {
            ...item,
            table: tableId ? { id: tableId } as const : undefined,
            tableData: tableDataId ? { id: tableDataId, name: tagName, table: { id: tableId } } : undefined,
            tag: { id: tagId, name: tagName } as const,
            key: `${tableId}-${tableDataId}-${tagId}`,
            name: tagName || `${tableId}-${tableDataId}-${tagId}`,
            fields: [tagField],
            id: tableDataId,
            fixed: item.fixed,
            title: item.title,
            query: item.query
          } as DataItemConfig
        }),

        // 处理 columns
        ...(columns || []).map((col, i) => {
          if (col.field && (col.tableData || col.table)) {
            const node = col?.tableData
            const table = col?.table
            let nodeId = node?.id
            let tableId = table?.id || table

            if (table?.tableMajorType && table?.tableMajorType === 'settable') {
              nodeId = node?.tabledata || node?.id
              tableId = node?.table || tableId
            }

            return {
              ...col,
              key: `${tableId}-${nodeId || 'all'}-${i}`,
              name: `${table?.title || tableId}-${node?.name || nodeId || '全部'}-${col.field}`,
              fields: [(hasGroup(group) || noTime || col.groupType) ? convertField({
                field: col.field,
                groupType: col.groupType,
                method: undefined // 可以从配置中获取
              }) : col.field],
              id: nodeId,
              table: tableId,
            }
          }
        }).filter(Boolean)
      ]

      const items = itemsWithNull.filter((item): item is DataItemConfig => item !== null)

      if (items.length === 0) {
        return
      }

      setLoading(true)

      // 获取时间范围
      const finalTimeRange = await getTimeRange(timeRange || {})

      // 执行查询
      const result = await queryData(
        items,
        finalTimeRange,
        group,
        noTime,
        xFormat,
        statisType,
        type,
        startTime,
        getOtherCondition,
        sortByTime
      )

      setDataset(result || null)
      setRequestId(`${Date.now()}-${Math.random().toString(36).substring(2, 9)}`)
    } catch (err) {
      toast.error('数据查询出现错误，请检查数据')
    } finally {
      setLoading(false)
    }
  }, [timeRange, group, tags, columns, noTime, xFormat, statisType, type, startTime, sortByTime, getOtherCondition])

  // 保存到 ref
  queryCallback.current = queryDataHandler

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
    if (!interval || interval <= 0) {
      return
    }

    const tick = () => {
      queryCallback.current?.()
    }

    const id = setInterval(tick, interval * 1000)
    return () => clearInterval(id)
  }, [interval])

  // 过滤空数据
  const filterDataset = dataset ? cloneDeep(dataset) : null

  if (emptyDataFilter && filterDataset) {
    if ('source' in filterDataset && filterDataset.source) {
      const lastData = last(filterDataset.source)
      if (Array.isArray(lastData)) {
        const empty = lastData?.slice(1).every(d => isNull(d))
        if (empty) {
          filterDataset.source = slice(filterDataset.source, 0, -1)
        }
      }
    }
  }

  return {
    dataset: filterDataset,
    loading,
    requestId
  }
}

/**
 * 历史数据源组件 - 纯容器，不包含任何布局和样式
 * 内部集成 ContextProvider，子组件通过 useContextProvider 获取数据
 * 优化：只在查询参数变化时更新数据，避免大数据集的不必要比较
 */
export function DatasourceHistory({
  id = 'datasource-history',
  timeRange,
  group,
  tags = [],
  columns = [],
  interval = 0,
  xFormat = 'YYYY-MM-DD HH:mm:ss',
  submit,
  children
}: DatasourceHistoryProps) {
  // 使用历史数据
  const { dataset, loading, requestId } = useHistoryData({
    timeRange,
    group,
    tags,
    columns,
    interval,
    xFormat,
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
