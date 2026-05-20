'use client'

import { useMemo, useEffect, useState, useRef, useCallback, type ReactNode } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import keys from 'lodash/keys'
import isString from 'lodash/isString'
import isObject from 'lodash/isObject'
import isEmpty from 'lodash/isEmpty'
import isUndefined from 'lodash/isUndefined'
import isPlainObject from 'lodash/isPlainObject'
import isNull from 'lodash/isNull'
import get from 'lodash/get'
import isFunction from 'lodash/isFunction'
import { api, useDatasetSet } from '@airiot/client'
import { toast } from 'sonner'
import { ContextProvider } from '@/components/kesi/container-context-provider/context-provider'
import { numberFormat, dateFormat } from '@/lib/datasource-utils'
import type { TableInfo } from '@/lib/datasource-types'

// ==================== Types ====================

/**
 * 字段配置
 */
export interface FieldConfig {
  id?: string
  key?: string
  type?: string
  title?: string
  name?: string
  propertyType?: string
  tableName?: string
  transform?: (value: any) => any
  config?: string
  enum1?: any[]
  enum_title1?: any[]
  [key: string]: any
}

/**
 * Schema 结构
 */
export interface Schema {
  name?: string
  properties?: Record<string, FieldConfig>
  [key: string]: any
}

/**
 * 分组配置
 */
export interface GroupItemConfig {
  field?: string | FieldConfig
  dateOperator?: '天' | '周' | '月' | '年' | '一小时内的分钟数' | '一天内的小时数' | '一周内的天数' | '一月内的天数' | '一年内的天数' | '一年内的星期数' | '一年内的月数'
  [key: string]: any
}

/**
 * 列配置
 */
export interface ColumnItemConfig {
  name?: string
  field?: string | FieldConfig
  accumulator?: '$count' | '$avg' | '$first' | '$last' | '$max' | '$min' | '$sum'
  expression?: any
  [key: string]: any
}

/**
 * 字段格式化配置
 */
export interface FieldFormatConfig {
  field: FieldConfig | { id?: string; key?: string; title?: string; type?: string; propertyType?: string; value?: string; name?: string }
  format?: string | { format?: string; type?: string }
}

/**
 * 表数据查询配置
 */
export interface TableDataConfig {
  selectType?: 'table' | 'dataset'
  table?: TableInfo & { value?: string; id?: string; key?: string }
  initFilter?: Record<string, any>
  isGroup?: boolean
  queryFields?: string[]
  projectAll?: boolean
  fieldOrder?: Array<{ value: string; order?: 'ASC' | 'DESC' }>
  group?: GroupItemConfig[]
  columns?: ColumnItemConfig[]
  statsBySingle?: boolean | null
  limit?: number
  skip?: number
  interval?: number
  showInnerField?: boolean
  feildFormat?: FieldFormatConfig[]
  extraSchema?: any
  submit?: string
}

export interface DatasourceTableProps {
  id?: string
  selectType?: 'table' | 'dataset'
  table?: any
  initFilter?: Record<string, any>
  isGroup?: boolean
  showInnerField?: boolean
  statsBySingle?: any
  feildFormat?: Array<any>
  queryFields?: string[]
  interval?: number
  submit?: string
  children?: ReactNode
}

// 默认配置
export const defaultTableConfig: TableDataConfig = {
  selectType: 'table',
  table: {
    id: 'A',
    name: 'A'
  },
  initFilter: undefined,
  isGroup: false,
  showInnerField: false,
  statsBySingle: null,
  feildFormat: [],
  fieldOrder: undefined,
  group: undefined,
  columns: [],
  limit: undefined,
  skip: undefined,
  interval: undefined,
  projectAll: undefined,
  queryFields: [],
  extraSchema: undefined,
  submit: undefined
}

// ==================== Constants ====================

const ACCUMULATOR_LABELS: Record<string, string> = {
  '$count': '个数',
  '$avg': '平均值',
  '$first': '首位值',
  '$last': '末尾值',
  '$max': '最大值',
  '$min': '最小值',
  '$sum': '总和'
}

const INNER_FIELDS = [
  '_department',
  '_departmentInfo',
  '_deptTableAndField',
  '_parent',
  'deletePermission',
  'editPermission'
]

const SPECIAL_RESOURCE_IDS: Record<string, string> = {
  '_#$airiot_log': 'core/log',
  '_#$airiot_warning': 'warning/warning'
}

// ==================== Utility Functions ====================

const fetchSchema = async ({ id, selectType }: { id?: string; selectType?: string }): Promise<Schema | null> => {
  if (!id) return null

  try {
    if (selectType === 'dataset') {
      const { json } = await api({ name: `ds/dataset/jst/schema/${id}` }).fetch('')
      const schema = cloneDeep(json?.schema || {})

      for (const key of keys(schema.properties)) {
        const item = schema.properties[key]
        if (item?.tableName) {
          item.title = `${item.title}(${item.tableName})`
        }
      }

      return schema
    } else {
      if (id in SPECIAL_RESOURCE_IDS) {
        return null
      }

      const { json } = await api({ name: `core/t/schema/${id}` }).fetch('')
      return json?.schema || {}
    }
  } catch (error) {
    return null
  }
}

const dealExtraSchema = async (
  list: any[],
  extraSchema: any,
  table: TableDataConfig['table']
): Promise<any[]> => {
  if (!list?.length || !extraSchema || !table?.key) {
    return list
  }

  try {
    const { json } = await api({ name: `core/t/schema/${table.key}` }).fetch('')
    const tableSchemaProperties = json?.schema?.properties

    if (!tableSchemaProperties) {
      return list
    }

    return list.map(item => {
      const res: Record<string, any> = {}

      Object.keys(item).forEach(key => {
        res[key] = item[key]

        if (tableSchemaProperties[key]?.config === '选择器') {
          const num = tableSchemaProperties[key].enum1?.indexOf(item[key])
          const label = tableSchemaProperties[key].enum_title1?.[num]
          if (label !== undefined) {
            res[key + '-label'] = label
          }
        }
      })

      return res
    })
  } catch (error) {
    return list
  }
}

const makeDateOperation = ({ dateOperator, field }: GroupItemConfig): any => {
  const fieldId = isObject(field) ? (field as FieldConfig).id : field
  if (!fieldId) return null

  const $field = '$' + fieldId

  switch (dateOperator) {
    case '天':
      return { $dateToString: { format: '%Y-%m-%d', date: $field } }
    case '周':
      return { $dateToString: { format: '%Y-%V', date: $field } }
    case '月':
      return { $dateToString: { format: '%Y-%m', date: $field } }
    case '年':
      return { $year: $field }
    case '一小时内的分钟数':
      return { $minute: $field }
    case '一天内的小时数':
      return { $hour: $field }
    case '一周内的天数':
      return { $dayOfWeek: $field }
    case '一月内的天数':
      return { $dayOfMonth: $field }
    case '一年内的天数':
      return { $dayOfYear: $field }
    case '一年内的星期数':
      return { $week: $field }
    case '一年内的月数':
      return { $month: $field }
    default:
      return $field
  }
}

const buildQuery = (
  group: GroupItemConfig[] = [],
  columns: ColumnItemConfig[] = [],
  schema: Schema | null
): { groupBy: Record<string, any>; groupFields: Record<string, any> } => {
  const groupBy: Record<string, any> = {}
  const groupFields: Record<string, any> = {}

  group.forEach(g => {
    if (!g.field) return

    const field = isPlainObject(g.field)
      ? (g.field as FieldConfig).type === 'tag'
        ? 'param-' + (g.field as FieldConfig).id
        : (g.field as FieldConfig).id || (g.field as FieldConfig).key
      : g.field

    if (!field) return

    let key = field
    const properties = schema?.properties || {}

    if (key && typeof key === 'string' && key.indexOf('.') > 0) {
      key = key.split('.').join('.properties.')
    }

    const fieldTitle = get(properties, `${field}.title`)
    const name = field === 'fields.id' ? '数据点标识' : (typeof fieldTitle === 'string' ? fieldTitle : fieldTitle?.title) || '未命名'

    if (g.dateOperator) {
      groupBy[String(name)] = makeDateOperation(g)
    } else {
      const $key = '$' + (key === 'tableDataId' ? 'tableData' : key)
      groupBy[String(name)] = $key
    }
  })

  columns.forEach(column => {
    const name = column.name || ACCUMULATOR_LABELS[column.accumulator || '']

    if (!column.accumulator) return

    if (column.accumulator === '$count') {
      groupFields[String(name)] = { $sum: 1 }
    } else if (column.field || column.expression) {
      const field = isPlainObject(column.field)
        ? (column.field as FieldConfig).type === 'tag'
          ? 'param-' + (column.field as FieldConfig).id
          : (column.field as FieldConfig).id
        : column.field

      const $field = field ? '$' + field : column.expression
      groupFields[String(name)] = { [column.accumulator]: $field }
    }
  })

  return { groupBy, groupFields }
}

const sortObjectsByKeyOrder = (
  arrayOfObjects: Record<string, any>[],
  keyOrder: string[]
): Record<string, any>[] => {
  return arrayOfObjects.map(obj => {
    const entries = Object.entries(obj)

    entries.sort(([keyA], [keyB]) => {
      const indexA = keyOrder.indexOf(keyA)
      const indexB = keyOrder.indexOf(keyB)

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB
      } else if (indexA !== -1) {
        return -1
      } else if (indexB !== -1) {
        return 1
      }
      return 0
    })

    return Object.fromEntries(entries)
  })
}

const getColumnFieldMapping = (columns: ColumnItemConfig[] = []): Map<string, string> => {
  const mapping = new Map<string, string>()

  columns.forEach(column => {
    const displayName = column.name || ACCUMULATOR_LABELS[column.accumulator || '']
    if (displayName && column.field && typeof column.field !== 'string' && column.field.id) {
      mapping.set(displayName, column.field.id)
    }
  })

  return mapping
}

const isInnerField = (key: string): boolean => {
  return INNER_FIELDS.includes(key)
}

// ==================== Main Hook ====================

function useTableData(config: TableDataConfig) {
  const {
    selectType = 'table',
    table,
    initFilter = {},
    isGroup = false,
    queryFields = [],
    projectAll = false,
    fieldOrder = [],
    group = [],
    columns = [],
    statsBySingle = null,
    limit = 1000,
    skip = 0,
    interval = 0,
    showInnerField = false,
    feildFormat = [],
    extraSchema,
    submit,
  } = config

  const [schema, setSchema] = useState<Schema | null>(null)
  const [dataset, setDataset] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)

  const queryCallback = useRef<(() => void) | null>(null)
  const lastSubmitRef = useRef<string | undefined>(undefined)
  const hasInitializedRef = useRef(false)

  const configRef = useRef({
    table,
    selectType,
    schema,
    initFilter,
    isGroup,
    queryFields,
    projectAll,
    fieldOrder,
    group,
    columns,
    statsBySingle,
    limit,
    skip,
    feildFormat,
    extraSchema,
    showInnerField
  })

  useEffect(() => {
    configRef.current = {
      table,
      selectType,
      schema,
      initFilter,
      isGroup,
      queryFields,
      projectAll,
      fieldOrder,
      group,
      columns,
      statsBySingle,
      limit,
      skip,
      feildFormat,
      extraSchema,
      showInnerField
    }
  })

  const fieldTransform = useMemo(() => {
    const transforms: Record<string, (value: any) => any> = {}

    if (Array.isArray(group)) {
      group.forEach(g => {
        const key = isString(g?.field) ? g.field : g?.field?.id
        if (!key) return

        let normalizedKey = key
        if (normalizedKey.indexOf('.') > 0) {
          normalizedKey = normalizedKey.split('.').join('.properties.')
        }

        const field = get(schema?.properties, normalizedKey)
        if (field?.transform && isFunction(field.transform)) {
          transforms[field.title || ''] = field.transform
        }
      })
    }

    return transforms
  }, [schema, group])

  const queryData = useCallback(async () => {
    const {
      table,
      selectType,
      schema,
      initFilter,
      isGroup,
      queryFields,
      projectAll,
      fieldOrder,
      group,
      columns,
      statsBySingle,
      limit,
      skip,
      feildFormat,
      extraSchema,
      showInnerField
    } = configRef.current

    const tableId = table?.value || table?.id
    if (!tableId || !schema) {
      return
    }

    try {
      setLoading(true)

      let resource = `core/t/${tableId}/d`

      if (selectType === 'dataset') {
        resource = `ds/dataset/jst/data/${tableId}`
      } else if (tableId in SPECIAL_RESOURCE_IDS) {
        resource = SPECIAL_RESOURCE_IDS[tableId]
      }

      const query: any = {
        filter: initFilter
      }

      let groupKeys: string[] = []

      if (isGroup || isUndefined(isGroup)) {
        const { groupBy, groupFields } = buildQuery(group, columns, schema)
        groupKeys = keys(groupBy)

        if (isEmpty(groupFields)) {
          setDataset([])
          return
        }

        query.groupBy = groupBy
        query.groupFields = groupFields
      } else {
        if (projectAll) {
          query.projectAll = true
        } else if (queryFields.length > 0) {
          query.project = {}
          queryFields.forEach(field => {
            query.project[field] = 1
          })
        }

        if (fieldOrder.length > 0) {
          query.sorts = fieldOrder.map(order => ({
            [order.value]: order?.order === 'ASC' ? 1 : -1
          }))
        }
      }

      query.limit = limit || 1000
      if (skip) {
        query.skip = skip
      }

      if (!isNull(statsBySingle)) {
        query.statsBySingle = statsBySingle
      }

      const queryString = encodeURIComponent(JSON.stringify(query))
      const { json } = await api({ name: resource }).fetch(`?query=${queryString}`)

      const resultList = await dealExtraSchema(json || [], extraSchema, table)

      const columnFieldMapping = getColumnFieldMapping(columns)

      const sortedData = groupKeys.length > 0
        ? sortObjectsByKeyOrder(resultList, groupKeys)
        : resultList

      const transformedData = sortedData.map(item => {
        const transformedItem: Record<string, any> = {}

        Object.entries(item).forEach(([k, v]) => {
          const mappedFieldId = columnFieldMapping.get(k)
          const actualKey = mappedFieldId || k

          if (isInnerField(actualKey) && !showInnerField) {
            return
          }

          if (fieldTransform[k]) {
            transformedItem[k] = fieldTransform[k](v)
          } else {
            let formatted = false

            for (const fieldFormat of feildFormat || []) {
              const fieldId = fieldFormat?.field?.id || fieldFormat?.field?.key
              const fieldTitle = fieldFormat?.field?.title

              if (fieldId === actualKey || fieldTitle === actualKey) {
                const fieldType = fieldFormat?.field?.propertyType || fieldFormat?.field?.type
                const formatValue = typeof fieldFormat?.format === 'string'
                  ? fieldFormat.format
                  : fieldFormat?.format?.format || ''

                if (fieldType === 'string') {
                  transformedItem[k] = dateFormat(formatValue, v)
                } else {
                  transformedItem[k] = numberFormat(formatValue, v)
                }

                formatted = true
                break
              }
            }

            if (!formatted) {
              transformedItem[k] = v
            }
          }
        })

        return transformedItem
      })

      setDataset(transformedData)
      setRequestId(`${Date.now()}-${Math.random().toString(36).substring(2, 9)}`)
    } catch (error) {
      toast.error('数据查询出现错误，请检查数据')
      setDataset([])
      setRequestId(`${Date.now()}-${Math.random().toString(36).substring(2, 9)}`)
    } finally {
      setLoading(false)
    }
  }, [])

  queryCallback.current = queryData

  useEffect(() => {
    const tableId = table?.value || table?.id
    if (!tableId) {
      return
    }

    hasInitializedRef.current = false
    lastSubmitRef.current = undefined

    fetchSchema({ id: tableId, selectType })
      .then(setSchema)
      .catch(err => {
        setSchema(null)
      })
  }, [table?.value, table?.id, selectType, table])

  useEffect(() => {
    const tableId = table?.value || table?.id

    if (!tableId || !schema?.name) {
      return
    }

    if (hasInitializedRef.current && lastSubmitRef.current === submit) {
      return
    }

    hasInitializedRef.current = true
    lastSubmitRef.current = submit

    queryData()
  }, [submit, schema?.name])

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

  return {
    dataset,
    loading,
    requestId
  }
}

export function DatasourceTable({
  id = 'datasource-table',
  selectType = 'table',
  table,
  initFilter,
  isGroup = false,
  showInnerField = false,
  statsBySingle,
  feildFormat,
  queryFields,
  interval = 0,
  submit,
  children
}: DatasourceTableProps) {
  const datasetSet = useDatasetSet(id)

  const { dataset, loading, requestId } = useTableData({
    selectType,
    table,
    initFilter,
    isGroup,
    showInnerField,
    statsBySingle,
    feildFormat,
    queryFields,
    interval,
    submit
  })

  useEffect(() => {
    datasetSet({ data: dataset, loading })
  }, [requestId, loading, datasetSet])

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
