import * as React from 'react'
import isObject from 'lodash/isObject'
import isArray from 'lodash/isArray'
import { createAPI } from '@airiot/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { fieldRender } from '@/lib/form-relate-utils'

export interface FormRelatePlusDataShowProps {
  schema: {
    showType?: 'select' | 'card' | 'table'
    relateShowFields?: Array<{
      key: string
      title: string
      fieldSchema?: any
    }>
    showField?: string
    relate?: {
      id?: string
    }
    relateTo?: string
  } & Record<string, any>
  value?: any
  field?: {
    displayField?: string
    relateShowFields?: Array<{
      key: string
      title: string
      fieldSchema?: any
    }>
  }
  val?: any
}

// Parse JSON strings in nested data
function parseJsonStrings(data: any): any {
  if (!data) return data

  const processValue = (value: any): any => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        if (typeof parsed === 'object' && parsed !== null) {
          return processValue(parsed)
        }
        return value
      } catch {
        return value
      }
    }

    if (isArray(value)) {
      return value.map(item => processValue(item))
    }

    if (isObject(value)) {
      Object.keys(value).forEach(key => {
        ; (value as Record<string, any>)[key] = processValue((value as Record<string, any>)[key])
      })
      return value
    }

    return value
  }

  return processValue(JSON.parse(JSON.stringify(data)))
}

type DataItem = {
  id?: string | number;
  [key: string]: any; // 允许任意字符串 key
};

// Single item display in card format
const ItemShow: React.FC<{
  schema: FormRelatePlusDataShowProps['schema']
  val: DataItem
  field?: FormRelatePlusDataShowProps['field']
  detailPage?: boolean
  relateTableData?: DataItem[]
}> = ({ schema, val, field, detailPage, relateTableData }) => {
  const displayField = field?.displayField || schema.showField || 'name'
  const showFields = schema.relateShowFields || []

  const value: DataItem = {
    ...(val || {}),
    ...(relateTableData?.find(item => item.id === val?.id) || {})
  };

  if (detailPage) {
    return (
      <Card className="inline-block w-[500px] mr-[5px] mt-[5px] bg-muted/50 rounded-md">
        <CardContent className="p-4">
          <div className="grid grid-cols-[5fr_19fr] gap-2 text-sm">
            <div className="text-muted-foreground">记录编号：</div>
            <div>{value.id}</div>
            {showFields.map((f) => (
              <React.Fragment key={f.key}>
                <div className="text-muted-foreground">{f.title}：</div>
                <div>
                  {fieldRender(value[f.key], f.fieldSchema)}
                </div>
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showFields.length > 0) {
    return (
      <Card className="inline-block w-[calc(50%-5px)] mr-[5px] mt-[5px] bg-muted/50 rounded-md">
        <CardContent className="p-3">
          <div className="mb-2">{value[displayField]}</div>
          {showFields.map((f) => (
            <div key={f.key} className="text-xs text-muted-foreground grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
              <span className="whitespace-nowrap">{f.title}：</span>
              <span className="break-all">
                {fieldRender(value[f.key], f.fieldSchema)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground mr-1 mt-1">
      {value[displayField]}
    </span>
  )
}

// Table display format
const TableShow: React.FC<FormRelatePlusDataShowProps> = (props) => {
  const { schema, field, val } = props
  const tableID = schema?.relate?.id

  const [loading, setLoading] = React.useState(true)
  const [tableSchema, setTableSchema] = React.useState<any>(null)

  React.useEffect(() => {
    if (tableID) {
      const schemaAPI = createAPI({
        resource: 'core/t/schema',
        name: 'schema'
      })

      schemaAPI.get(tableID)
        .then(({ schema }: any) => {
          setTableSchema(schema)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [tableID])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="text-sm text-muted-foreground">加载中...</div>
      </div>
    )
  }

  if (!tableSchema) {
    return null
  }

  if (!tableSchema?.fields?.length) {
    return <div className="text-sm text-muted-foreground py-2">请从右侧属性配置中选择显示字段</div>
  }

  const displayField = field?.displayField || schema.showField || 'name'
  const showFields = field?.relateShowFields || schema.relateShowFields || []
  const columns = [displayField, schema.showField, ...showFields.map((f: any) => f.key)]
    .filter(Boolean)

  return (
    <div className="w-full mt-2">
      <div className="border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((col: string) => (
                <th key={col} className="px-3 py-2 text-left font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {val?.map((item: any, index: number) => (
              <tr key={item.id || index} className="border-t">
                {columns.map((col: string) => (
                  <td key={col} className="px-3 py-2">
                    {fieldRender(item[col], tableSchema.fields.find((f: any) => f.key === col))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Main DataShow component
const FormRelatePlusDataShow: React.FC<FormRelatePlusDataShowProps> = (props) => {
  const { schema, value } = props
  const { showType = 'card' } = schema

  const [relateTableData, setRelateTableData] = React.useState<Array<Object>>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => { // 关联关联字段时后端只有ID，前端需要请求一次数据才能展示
    const rsf = schema?.relateShowFields || []
    const relateFields = rsf.filter((f: any) => f.fieldSchema?.config === '关联字段')
    if (relateFields.length > 0) {
      const api = createAPI({ resource: schema.name })

      // 使用 api.query 查询数据
      const relateFieldKeys = relateFields?.map((f: { key: string }) => f.key) || []
      api.query(
        {
          limit: 99999,
          fields: ['id', ...relateFieldKeys].filter(Boolean)
        }
      ).then(({ items }: any) => {
        setRelateTableData(items)
      }).finally(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  })

  const [expand, setExpand] = React.useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="text-sm text-muted-foreground">加载中...</div>
      </div>
    )
  }

  if (showType === 'table') {
    return <TableShow {...props} val={parseJsonStrings(value)} />
  } else {
    const parsedValue = parseJsonStrings(value)

    if (isArray(parsedValue)) {
      const items = parsedValue.length > 6 && !expand ? parsedValue.slice(0, 6) : parsedValue

      return (
        <div className="mt-2 space-y-1">
          {items?.map((v) => (
            <ItemShow key={v.id} {...props} val={v} relateTableData={relateTableData} />
          ))}
          {parsedValue?.length > 6 && !expand && (
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => setExpand(true)}
              className="text-primary"
            >
              展开更多（共{parsedValue.length}条）
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          )}
          {parsedValue?.length > 6 && expand && (
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => setExpand(false)}
              className="text-primary"
            >
              收起（共{parsedValue.length}条）
              <ChevronUp className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      )
    }

    if (parsedValue) {
      return (
        <div className="mt-2">
          <ItemShow {...props} val={parsedValue} relateTableData={relateTableData} />
        </div>
      )
    }

    return null
  }
}

export { FormRelatePlusDataShow }
export default FormRelatePlusDataShow
