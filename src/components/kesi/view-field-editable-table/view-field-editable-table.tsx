import React from 'react'
import isArray from 'lodash/isArray'
import isString from 'lodash/isString'
import { Table as TableIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { tableConverter } from '@/lib/view-table-converter'

/** 从 schema 中提取字段列表（兼容新旧格式） */
const getFields = (schema: any) => {
  const items = schema?.items
  // 新格式：items.formSchema + items.properties
  if (items?.formSchema && items?.properties) {
    return items.formSchema
      .map((s: any) => {
        const field = items.properties[s.key]
        return field ? { ...field, key: field.key || s.key } : null
      })
      .filter(Boolean)
  }
  // 旧格式：schema.tableFields?.form + schema.tableFields?.properties
  if (schema?.tableFields) {
    const { form, properties } = schema.tableFields
    return (form || [])
      .map((key: string) => {
        const field = properties?.[key]
        return field ? { ...field, key: field.key || key } : null
      })
      .filter(Boolean)
  }
  return []
}

/** 根据 controlType 获取列宽 */
const getColumnWidth = (controlType?: string) => {
  switch (controlType) {
    case 'upload-group':
      return 270
    case 'upload':
    case 'date-range':
    case 'map':
    case 'rich-text':
      return 220
    case 'boolean':
    case 'rate':
      return 80
    default:
      return 150
  }
}

// 表格展示组件
const TableComponent = ({
  value,
  schema,
}: {
  value: any[]
  schema: any
}) => {
  if (!isArray(value) || value.length === 0) {
    return <span className="text-muted-foreground">暂无数据</span>
  }

  const fields = getFields(schema)

  if (fields.length === 0) {
    return <span className="text-muted-foreground">未配置字段</span>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-slate-200 dark:border-slate-700">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-800">
            {fields.map((field: any) => (
              <th
                key={field.key}
                className="border border-slate-200 dark:border-slate-700 px-4 py-2 text-left text-sm font-medium"
                style={{ width: getColumnWidth(field.controlType) }}
              >
                {field.title || field.key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {value.map((row: any, rowIndex: number) => (
            <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              {fields.map((field: any) => {
                const FieldComponent = tableConverter(field, {})
                return (
                  <td
                    key={field.key}
                    className="border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm"
                  >
                    <FieldComponent
                      value={row?.[field.key]}
                      schema={field}
                      inList={true}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// 可编辑表格展示（主组件）
const EditableTable = ({ value, schema, inList = true }: { value: any; schema?: any; inList?: boolean }) => {
  const [open, setOpen] = React.useState(false)

  // 解析 value（可能是 JSON 字符串）
  let tableValue = value
  if (isString(value)) {
    try {
      tableValue = JSON.parse(value)
    } catch (e) {
      tableValue = []
    }
  }

  // 合并 defaultVal
  const displayValue = tableValue || schema?.defaultVal || []

  if (!isArray(displayValue) || displayValue.length === 0) {
    return <span className="text-muted-foreground">空</span>
  }

  const title = schema?.title || '表格内容'

  // 列表中的展示（点击打开弹窗）
  if (inList) {
    return (
      <>
        <div
          className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
          onClick={() => setOpen(true)}
        >
          <TableIcon className="h-4 w-4" />
          <span>{displayValue.length}</span>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <TableComponent value={displayValue} schema={schema} />
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // 直接展示
  return <TableComponent value={displayValue} schema={schema} />
}

export { EditableTable }
