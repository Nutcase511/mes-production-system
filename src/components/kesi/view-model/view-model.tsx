import React from 'react'
import { TableModel, Model, createAPI } from '@airiot/client'
import trans from '@/lib/schema-trans'
import type { ModelSchema } from '@/lib/model-types'

interface TableFilter {
  [key: string]: any
}

interface TableRef {
  id: string | number
  [key: string]: any
}

type ViewModelProps = {
  tableId?: string
  modelName?: string
  loadingComponent?: React.ReactNode,
  initQuery?: boolean,
  children?: React.ReactNode
  table?: TableRef
  isSchemaTransform?: boolean

  queryFields?: string[]
  projectAll?: boolean
  limit?: number
  tableFilters?: TableFilter
  fieldOrder?: Record<string, 'asc' | 'desc'>[]
  interval?: number
  autoQueryFields?: boolean
}

const ViewModel = ({ tableId, modelName, children, initQuery, loadingComponent,
  queryFields: queryFieldsProp, projectAll,
  limit,
  tableFilters,
  fieldOrder,
  interval,
  isSchemaTransform,
  autoQueryFields = true,
}: ViewModelProps) => {
  const [schema, setSchema] = React.useState<any>(null)
  const [queryFields, setQueryFields] = React.useState<string[] | undefined>(queryFieldsProp)
  const [initialValues, setInitialValues] = React.useState<any | null>(null)
  const initialized = React.useRef(false)

  // 自动获取 schema 推导 queryFields
  React.useEffect(() => {
    if (!autoQueryFields || !tableId) return
    createAPI({ resource: `core/t/schema/${encodeURIComponent(tableId)}` }).fetch('')
      .then((res: any) => {
        const schema = res?.json?.schema || res?.json || res?.schema || res
        if (schema?.properties) {
          setSchema(schema)
          setQueryFields(Object.keys(schema.properties))
        } else {
          setSchema(schema || { properties: {} })
        }
      })
      .catch(() => {
        setSchema({ properties: {} })
      })
  }, [])

  React.useEffect(() => {
    if (initialized.current) return
    if (autoQueryFields && !queryFields) return
    const values = {} as any
    if (queryFields && queryFields.length > 0) {
      values['fields'] = queryFields
    }
    if (projectAll) {
      values['projectAll'] = true
    }
    if (limit) {
      values['limit'] = limit
    }
    if (tableFilters) {
      values['wheres'] = { tableFilters }
    }
    if (fieldOrder && fieldOrder.length > 0) {
      const orderObj: Record<string, 'ASC' | 'DESC'> = {}
      fieldOrder.forEach(obj => {
        Object.entries(obj).forEach(([key, val]) => {
          orderObj[key] = val.toUpperCase() as 'ASC' | 'DESC'
        })
      })
      values['order'] = orderObj
    }
    setInitialValues(values)
    initialized.current = true
  }, [queryFields, projectAll, limit, tableFilters, fieldOrder, interval, autoQueryFields])

  if (initialValues === null) {
    return null
  } else if (modelName) {
    return (
      <Model name={modelName} schemaTransform={isSchemaTransform ? schemaTransform : undefined} key={`table-model-view-${modelName}`} initialValues={initialValues}>
        {children}
      </Model>
    )
  } else if (tableId) {
    return (
      <TableModel tableId={tableId} key={`table-model-view-${tableId}`} schemaTransform={isSchemaTransform ? schemaTransform : undefined} loadingComponent={loadingComponent} initQuery={initQuery} initialValues={initialValues}>
        {children}
      </TableModel>
    )
  } else {
    return null
  }
}

export { ViewModel }
export default ViewModel
