// @ts-nocheck - Required: This file processes dynamic JSON schemas from the AIRIOT SDK at
// runtime. The schema objects have no static type definitions, so all schema/formSchema/prop
// parameters use `any`. Adding proper types would require mirroring the AIRIOT platform's
// internal schema structure, which is undocumented and subject to change. The `any` usage
// is intentional — these hooks are thin schema-to-form transformers, not business logic.

import { useMemo } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { UseFormProps } from 'react-hook-form'

export interface UseFormSchemaProps {
  schema?: any
  formSchema?: any
}

export interface UseFormPropsExtended extends UseFormProps {
  schema?: any
  formSchema?: any
}

// fieldType 到 form type 的映射
const fieldTypeMap: Record<string, string> = {
  'datePicker': 'date',
  'dateRange': 'date-range',
  'timePicker': 'time',
  'select': 'select',
  'select-string': 'select',
  'select-number': 'select',
  'textarea': 'textarea',
  'inputNumber': 'number',
  'switch': 'switch',
  'checkbox': 'checkbox',
  'radio': 'radio',
  'slider': 'slider',
  'rate': 'rate',
  'rich-text': 'rich-text',
  'richText': 'rich-text',
  'map': 'map',
  'upload': 'upload',
  'upload-single': 'upload',
  'upload-multiple': 'upload',
  'upload-image': 'upload',
  'upload-file': 'upload',
  'link': 'link',
  'serial-number': 'serial-number',
  'user-role': 'user-role',
  'bytes-array': 'bytes-array',
  'reference': 'reference',
  'form-info': 'form-info',
  'editable-table': 'editable-table',
  'editable-card': 'editable-table',
  'relate': 'relate',
  'relate-plus': 'relate',
  'relate-select': 'relate',
  'relate-model-select': 'relate',
  'relate-async-select': 'relate',
  'relate-multi-select': 'relate',
  'table-select': 'tableselect',
  'tableData': 'tableData',
  'table-view': 'form-info',
  'widget': 'form-info',
  'area': 'area',
  'tree': 'select',
  'tree-select': 'select',
  'cascader': 'select',
  'transfer': 'select',
  'color': 'text',
  'password': 'text',
  'email': 'text',
  'url': 'text',
  'tel': 'text',
}

// 检查字段是否是关联字段
const isRelateField = (prop: any): boolean => {
  return !!(
    prop?.config === '关联字段' ||
    prop?.relateTo ||
    prop?.relate?.id ||
    prop?.fieldType === 'relate' ||
    prop?.fieldType === 'relate-plus' ||
    prop?.fieldType === 'relate-select' ||
    prop?.fieldType === 'relate-multi-select' ||
    prop?.controlType === 'relate' ||
    prop?.controlType === 'relate-multiple'
  )
}

// 获取字段的实际类型（考虑关联字段的特殊情况）
const getFieldType = (prop: any, defaultType: string = 'string'): string => {
  // 优先检查是否是关联字段
  if (isRelateField(prop)) {
    return 'relate'
  }

  // 然后按原有逻辑处理
  const rawFieldType = prop?.fieldType || prop?.controlType || prop?.type || defaultType
  return fieldTypeMap[rawFieldType] || rawFieldType
}

export function useFormSchema({ schema, formSchema }: UseFormSchemaProps) {
  const fields = useMemo(() => {
    // 情况1：formSchema 是字符串数组（字段名列表）
    if (Array.isArray(formSchema) && formSchema.length > 0 && typeof formSchema[0] === 'string') {
      return formSchema.map((fieldName: string) => {
        const prop = schema?.properties?.[fieldName]
        const mappedType = getFieldType(prop, 'string')

        // 处理 enum 到 options 的转换
        // 优先使用 enum1/enum_title1，其次使用 enum
        let options = undefined
        if (prop?.enum1 && Array.isArray(prop.enum1)) {
          const titles = prop?.enum_title1 || prop.enum1
          options = prop.enum1.map((val: any, index: number) => ({
            value: val,
            label: titles[index] || val
          }))
        } else if (prop?.enum && Array.isArray(prop.enum)) {
          options = prop.enum.map((val: any) => ({
            value: val,
            label: val
          }))
        }

        return {
          key: fieldName,
          name: fieldName,
          label: prop?.title || fieldName,
          title: prop?.title || fieldName,
          ...prop,
          type: mappedType,
          required: schema?.required?.includes(fieldName),
          ...(options ? { options } : {}),
        }
      })
    }

    // 情况2：formSchema 是对象数组（带配置的字段列表）
    if (Array.isArray(formSchema) && formSchema.length > 0 && typeof formSchema[0] === 'object') {
      const result: any[] = []

      for (const item of formSchema) {
        // 处理通配符 '*'
        if (item === '*') {
          if (schema?.properties) {
            const addedKeys = new Set(result.map(f => f.key || f.name))
            Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
              if (!addedKeys.has(key)) {
                const mappedType = getFieldType(prop, 'string')

                // 处理 enum 到 options 的转换
                // 优先使用 enum1/enum_title1，其次使用 enum
                let options = undefined
                if (prop?.enum1 && Array.isArray(prop.enum1)) {
                  const titles = prop?.enum_title1 || prop.enum1
                  options = prop.enum1.map((val: any, index: number) => ({
                    value: val,
                    label: titles[index] || val
                  }))
                } else if (prop?.enum && Array.isArray(prop.enum)) {
                  options = prop.enum.map((val: any) => ({
                    value: val,
                    label: val
                  }))
                }

                result.push({
                  key: key,
                  name: key,
                  label: prop.title || key,
                  title: prop.title || key,
                  ...prop,
                  type: mappedType,
                  required: schema?.required?.includes(key),
                  ...(options ? { options } : {}),
                })
              }
            })
          }
        } else if (item && (item.key || item.name)) {
          // 处理显式指定的字段
          const fieldKey = item.key || item.name
          const prop = schema?.properties?.[fieldKey]

          // 优先检查是否是关联字段
          let mappedType
          if (isRelateField(prop) || isRelateField(item)) {
            mappedType = 'relate'
          } else {
            const itemFieldType = item?.fieldType || item?.controlType
            const propFieldType = prop?.fieldType || prop?.controlType || prop?.type
            const rawFieldType = itemFieldType || propFieldType || 'string'
            mappedType = fieldTypeMap[rawFieldType] || rawFieldType
          }

          // 处理 enum 到 options 的转换
          // 优先使用 item.options，其次使用 prop.enum1/enum_title1，最后使用 prop.enum
          let options = item?.options || prop?.options
          if (!options && prop?.enum1 && Array.isArray(prop.enum1)) {
            const titles = prop?.enum_title1 || prop.enum1
            options = prop.enum1.map((val: any, index: number) => ({
              value: val,
              label: titles[index] || val
            }))
          } else if (!options && prop?.enum && Array.isArray(prop.enum)) {
            options = prop.enum.map((val: any) => ({
              value: val,
              label: val
            }))
          }

          result.push({
            key: fieldKey,
            name: fieldKey,
            label: item.title || prop?.title || fieldKey,
            title: item.title || prop?.title || fieldKey,
            required: schema?.required?.includes(fieldKey),
            ...prop,
            ...item,  // item 的配置优先级更高
            type: mappedType,
            ...(options ? { options } : {}),
          })
        }
      }

      return result
    }

    // 情况3：formSchema 是对象
    if (formSchema && typeof formSchema === 'object' && !Array.isArray(formSchema)) {
      if (formSchema.fields) {
        return formSchema.fields
      }
      // 转换为数组格式
      return Object.entries(formSchema).map(([key, val]: [string, any]) => ({
        key: key,
        name: key,
        title: val.title || key,
        type: val.type || 'string',
        ...val
      }))
    }

    // 默认：从 schema.properties 生成所有字段
    if (schema?.properties) {
      return Object.entries(schema.properties).map(([key, prop]: [string, any]) => {
        const mappedType = getFieldType(prop, 'string')

        // 处理 enum 到 options 的转换
        // 优先使用 enum1/enum_title1，其次使用 enum
        let options = undefined
        if (prop?.enum1 && Array.isArray(prop.enum1)) {
          const titles = prop?.enum_title1 || prop.enum1
          options = prop.enum1.map((val: any, index: number) => ({
            value: val,
            label: titles[index] || val
          }))
        } else if (prop?.enum && Array.isArray(prop.enum)) {
          options = prop.enum.map((val: any) => ({
            value: val,
            label: val
          }))
        }

        return {
          name: key,
          key: key,
          label: prop.title || key,
          title: prop.title || key,
          required: schema.required?.includes(key),
          ...prop,
          type: mappedType,
          ...(options ? { options } : {}),
        }
      })
    }

    return []
  }, [schema, formSchema])

  const resolver = useMemo(() => {
    // 创建一个基本的 zod schema 从字段
    const zodSchema: Record<string, any> = {}
    for (const field of fields) {
      if (field.required) {
        zodSchema[field.name || field.key] = z.any()
      } else {
        zodSchema[field.name || field.key] = z.any().optional()
      }
    }
    return zodResolver(z.object(zodSchema))
  }, [fields])

  return { fields, resolver }
}

export function useFilterSchema({ schema, formSchema }: UseFormSchemaProps) {
  // 过滤器表单：直接实现，所有字段都不应该是必填的
  const fields = useMemo(() => {
    // 情况1：formSchema 是字符串数组（字段名列表）
    if (Array.isArray(formSchema) && formSchema.length > 0 && typeof formSchema[0] === 'string') {
      return formSchema.map((fieldName: string) => {
        const prop = schema?.properties?.[fieldName]
        const mappedType = getFieldType(prop, 'string')

        // 处理 enum 到 options 的转换
        let options = undefined
        if (prop?.enum1 && Array.isArray(prop.enum1)) {
          const titles = prop?.enum_title1 || prop.enum1
          options = prop.enum1.map((val: any, index: number) => ({
            value: val,
            label: titles[index] || val
          }))
        } else if (prop?.enum && Array.isArray(prop.enum)) {
          options = prop.enum.map((val: any) => ({
            value: val,
            label: val
          }))
        }

        return {
          key: fieldName,
          name: fieldName,
          label: prop?.title || fieldName,
          title: prop?.title || fieldName,
          ...prop,
          type: mappedType,
          required: false, // 过滤器中所有字段都是可选的
          ...(options ? { options } : {}),
        }
      })
    }

    // 情况2：formSchema 是对象数组（带配置的字段列表）
    if (Array.isArray(formSchema) && formSchema.length > 0 && typeof formSchema[0] === 'object') {
      const result: any[] = []

      for (const item of formSchema) {
        // 处理通配符 '*'
        if (item === '*') {
          if (schema?.properties) {
            const addedKeys = new Set(result.map(f => f.key || f.name))
            Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
              if (!addedKeys.has(key)) {
                const mappedType = getFieldType(prop, 'string')

                // 处理 enum 到 options 的转换
                let options = undefined
                if (prop?.enum1 && Array.isArray(prop.enum1)) {
                  const titles = prop?.enum_title1 || prop.enum1
                  options = prop.enum1.map((val: any, index: number) => ({
                    value: val,
                    label: titles[index] || val
                  }))
                } else if (prop?.enum && Array.isArray(prop.enum)) {
                  options = prop.enum.map((val: any) => ({
                    value: val,
                    label: val
                  }))
                }

                result.push({
                  key: key,
                  name: key,
                  label: prop.title || key,
                  title: prop.title || key,
                  ...prop,
                  type: mappedType,
                  required: false, // 过滤器中所有字段都是可选的
                  ...(options ? { options } : {}),
                })
              }
            })
          }
        } else if (item && (item.key || item.name)) {
          // 处理显式指定的字段
          const fieldKey = item.key || item.name
          const prop = schema?.properties?.[fieldKey]

          // 优先检查是否是关联字段
          let mappedType
          if (isRelateField(prop) || isRelateField(item)) {
            mappedType = 'relate'
          } else {
            const itemFieldType = item?.fieldType || item?.controlType
            const propFieldType = prop?.fieldType || prop?.controlType || prop?.type
            const rawFieldType = itemFieldType || propFieldType || 'string'
            mappedType = fieldTypeMap[rawFieldType] || rawFieldType
          }

          // 处理 enum 到 options 的转换
          let options = item?.options || prop?.options
          if (!options && prop?.enum1 && Array.isArray(prop.enum1)) {
            const titles = prop?.enum_title1 || prop.enum1
            options = prop.enum1.map((val: any, index: number) => ({
              value: val,
              label: titles[index] || val
            }))
          } else if (!options && prop?.enum && Array.isArray(prop.enum)) {
            options = prop.enum.map((val: any) => ({
              value: val,
              label: val
            }))
          }

          result.push({
            key: fieldKey,
            name: fieldKey,
            label: item.title || prop?.title || fieldKey,
            title: item.title || prop?.title || fieldKey,
            required: false, // 过滤器中所有字段都是可选的
            ...prop,
            ...item,  // item 的配置优先级更高
            type: mappedType,
            ...(options ? { options } : {}),
          })
        }
      }

      return result
    }

    // 情况3：formSchema 是对象
    if (formSchema && typeof formSchema === 'object' && !Array.isArray(formSchema)) {
      if (formSchema.fields) {
        return formSchema.fields.map((f: any) => ({ ...f, required: false }))
      }
      // 转换为数组格式
      return Object.entries(formSchema).map(([key, val]: [string, any]) => ({
        key: key,
        name: key,
        title: val.title || key,
        type: val.type || 'string',
        required: false,
        ...val
      }))
    }

    // 默认：从 schema.properties 生成所有字段
    if (schema?.properties) {
      return Object.entries(schema.properties).map(([key, prop]: [string, any]) => {
        const mappedType = getFieldType(prop, 'string')

        // 处理 enum 到 options 的转换
        let options = undefined
        if (prop?.enum1 && Array.isArray(prop.enum1)) {
          const titles = prop?.enum_title1 || prop.enum1
          options = prop.enum1.map((val: any, index: number) => ({
            value: val,
            label: titles[index] || val
          }))
        } else if (prop?.enum && Array.isArray(prop.enum)) {
          options = prop.enum.map((val: any) => ({
            value: val,
            label: val
          }))
        }

        return {
          name: key,
          key: key,
          label: prop.title || key,
          title: prop.title || key,
          required: false, // 过滤器中所有字段都是可选的
          ...prop,
          type: mappedType,
          ...(options ? { options } : {}),
        }
      })
    }

    return []
  }, [schema, formSchema])

  // 创建 resolver，所有字段都是可选的
  const resolver = useMemo(() => {
    const zodSchema: Record<string, any> = {}
    for (const field of fields) {
      zodSchema[field.name || field.key] = z.any().optional()
    }
    return zodResolver(z.object(zodSchema))
  }, [fields])

  return { fields, resolver }
}