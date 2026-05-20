import * as React from 'react'
import { createAPI } from '@airiot/client'
import { Loader2 } from 'lucide-react'
import { fieldRender } from '@/lib/form-relate-utils'
import debounce from 'lodash/debounce'

export interface FormReferenceProps {
  schema?: {
    key?: string
    searchRelate?: {
      field?: {
        key?: string
        fieldSchema?: any
      }
    }
    numberFormat?: string
  }
  field?: {
    key?: string
  }
  option?: {
    schema?: {
      name?: string
    }
  }
  tableData?: any
}

const FormReference: React.FC<FormReferenceProps> = (props) => {
  const { schema, field, option, tableData } = props
  const [data, setData] = React.useState<any>({})
  const [val, setVal] = React.useState<any>()
  const [loading, setLoading] = React.useState(false)

  // 使用防抖更新数据
  const debouncedSetData = React.useMemo(
    () => debounce((v: any) => setData(v), 800),
    []
  )

  React.useEffect(() => {
    if (tableData) {
      debouncedSetData(tableData)
    }
  }, [tableData, debouncedSetData])

  React.useEffect(() => {
    // 从 schema.name 或 option.schema.name 中提取 tableId
    // 格式: core/t/表ID/d
    const schemaName = option?.schema?.name || ''
    const tableId = schemaName?.split('/')?.[2]

    if (tableId) {
      setLoading(true)
      const api = createAPI({
        resource: 'computerecord/computerecord/search',
        name: 'reference'
      })

      // 使用 fetch 调用计算记录 API
      api
        .query({}, {
          method: 'POST',
          body: JSON.stringify({
            tableId,
            data: data || {}
          })
        } as any)
        .then((result: any) => {
          if (result && !isEmpty(result)) {
            setVal(result)
          }
        })
        .catch((err) => {
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [data, option?.schema?.name])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        计算中...
      </div>
    )
  }

  const displayValue = val?.[field?.key || schema?.key || '']
  const fieldSchema = schema?.searchRelate?.field?.fieldSchema

  return (
    <span>
      {fieldRender(displayValue, fieldSchema)}
    </span>
  )
}

function isEmpty(obj: any) {
  return obj === null || obj === undefined || Object.keys(obj).length === 0
}

export { FormReference }
