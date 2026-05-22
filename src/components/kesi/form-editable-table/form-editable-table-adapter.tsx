import React from 'react'
import { FormEditableTable } from '@/components/kesi/form-editable-table/form-editable-table'

interface FormEditableTableAdapterProps {
  onChange?: (value: any[] | null) => void
  value?: any[]
  schema?: {
    key?: string
    disabled?: boolean
    minCount?: number
    maxCount?: number
    displayForm?: 'grid' | 'card'
    uniqueFields?: string[]
    uniqueRow?: boolean
    fieldRules?: any
    showPagination?: boolean
    btnText?: Record<string, string>
    // AIRIOT 旧格式
    tableFields?: {
      form?: string[]
      properties?: Record<string, any>
    }
    // 新格式
    items?: {
      formSchema?: Array<{ key: string }>
      properties?: Record<string, any>
    }
  }
  record?: any
}

/**
 * FormEditableTable 适配器
 * 将 AIRIOT 的 tableFields 格式转换为 FormEditableTable 需要的 items 格式
 */
const FormEditableTableAdapter: React.FC<FormEditableTableAdapterProps> = (props) => {
  const { schema, ...rest } = props

  // 转换 schema 格式
  const adaptedSchema = React.useMemo(() => {
    if (!schema) return schema

    // 如果已经有新格式 items，直接返回
    if (schema.items?.formSchema && schema.items?.properties) {
      return schema
    }

    // 将 tableFields 转换为 items 格式
    if (schema.tableFields?.form && schema.tableFields?.properties) {
      const { form, properties } = schema.tableFields

      // 提取字段键列表
      const fieldKeys = Array.isArray(form) ? form : []

      // 转换为 formSchema 格式
      const formSchema = fieldKeys
        .map(key => {
          const field = properties[key]
          return field ? { key: field.key || key } : null
        })
        .filter(Boolean)

      return {
        ...schema,
        items: {
          formSchema,
          properties,
        },
      }
    }

    return schema
  }, [schema])

  return (
    <div className="w-full overflow-x-auto">
      <FormEditableTable {...rest} schema={adaptedSchema} />
    </div>
  )
}

export { FormEditableTableAdapter as FormEditableTable }