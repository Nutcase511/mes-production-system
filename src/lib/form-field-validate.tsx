import type { FieldProperty } from '@/lib/model-types'

/**
 * 字段校验函数
 * 返回 undefined 表示校验通过，返回字符串表示错误信息
 */
export type FieldValidateFn = (value: unknown) => string | undefined | Promise<string | undefined>

/**
 * 根据 schema 生成校验函数
 */
export type ValidateFactory = (schema: FieldProperty) => FieldValidateFn | undefined

/**
 * controlType → 校验工厂映射
 */
const controlsValidate: Record<string, ValidateFactory> = {
  'editable-table': (schema) => {
    const items = schema?.items

    const hasEditableTableForms = items?.formSchema && items?.properties

    if (!hasEditableTableForms) return undefined

    const requiredFields: Array<{ key: string; title: string }> = []
    items.formSchema.forEach(({ key }: { key: string }) => {
      const fieldSchema = items.properties[key]
      if (fieldSchema?.need === true) {
        requiredFields.push({
          key: fieldSchema.key || key,
          title: fieldSchema.title || key
        })
      }
    })

    if (requiredFields.length === 0) return undefined

    return (value: unknown) => {
      const rows = value as unknown[]
      if (!Array.isArray(rows) || rows.length === 0) {
        return `请至少添加一条数据`
      }
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i] as Record<string, unknown>
        for (const field of requiredFields) {
          const fieldValue = row?.[field.key]
          if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
            return `第 ${i + 1} 行的「${field.title}」不能为空`
          }
        }
      }
      return undefined
    }
  },
}

/**
 * 根据 schema.controlType 获取校验函数
 */
export function getControlValidate(schema: FieldProperty): FieldValidateFn | undefined {
  const controlType = schema?.controlType
  if (!controlType) return undefined
  const factory = controlsValidate[controlType]
  if (!factory) return undefined
  return factory(schema)
}

export { controlsValidate }
