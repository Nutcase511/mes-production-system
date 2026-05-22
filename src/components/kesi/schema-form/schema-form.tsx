import {
  FieldGroup
} from "@/components/ui/field"
import { FormProvider, useForm, type UseFormPropsExtended, } from '@airiot/client'
import React, { type ReactNode } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { Resolver } from 'react-hook-form'
import { z } from 'zod'
import get from 'lodash/get'
import {
  convertToSchemaFormRules,
} from '@/lib/field-rules-hooks'
import type { FieldRules } from '@/lib/field-rules-hooks'
import { evaluateValidations, evaluateConditions } from '@/lib/field-rules-engine'

// 全局设置 Zod 中文错误提示
z.config({
  localeError: (issue) => {
    switch (issue.code) {
      case 'too_small':
        if (issue.origin === 'string') return '不能为空'
        if (issue.origin === 'array') return '请至少添加一条数据'
        return '值太小'
      case 'too_big':
        if (issue.origin === 'string') return '内容过长'
        if (issue.origin === 'array') return '超出最大数量'
        return '值太大'
      case 'invalid_type':
        if (issue.expected === 'string') return '请填写此项'
        if (issue.expected === 'number') return '请填写数字'
        return '请填写此项'
      case 'invalid_value':
        return '请选择有效的选项'
      default:
        return '请检查填写内容'
    }
  }
})

import { FormField } from "@/components/kesi/form-field/form-field"
import { formConverter } from '@/lib/view-form-converter'
import { getControlValidate } from '@/lib/form-field-validate'

import type { ModelSchema, FormSchemaItem } from '@/lib/model-types'

type SchemaFormProps = UseFormPropsExtended & {
  formId: string
  schema: ModelSchema,
  formSchema: FormSchemaItem[],
  schameConvert?: (schema: any, field: object) => void,
  onSubmit?: (data: any) => void
  isValid?: boolean
  showDescribe?: boolean
  children?: ReactNode | ((props: any) => ReactNode)
  classNames?: Record<'form' | 'group' | 'field' | 'label' | 'input' | 'description' | 'error', string> & { groupStyle?: React.CSSProperties }
  fieldRules?: FieldRules
}

const SchemaForm = ({ schema, formSchema, onSubmit, formId, children, showDescribe = true, isValid = true, classNames, schameConvert, onEffect, fieldRules, ...props }: SchemaFormProps) => {
  // 字段规则转换
  const schemaFieldRules = React.useMemo(
    () => fieldRules ? convertToSchemaFormRules(fieldRules) : undefined,
    [fieldRules]
  )

  // 跟踪动态必填字段（由规则引擎设置）
  const dynamicRequiredRef = React.useRef<Set<string>>(new Set())
  const rulesPrevValuesRef = React.useRef<Record<string, any>>({})

  // 包装 onEffect：在调用原始 onEffect 前更新动态必填
  const wrappedOnEffect = React.useCallback((values: any, methods: any) => {
    if (schemaFieldRules?.rules?.length) {
      dynamicRequiredRef.current.clear()
      const changedFields = new Set(
        Object.keys(values).filter(k => values[k] !== rulesPrevValuesRef.current[k])
      )
      for (const rule of schemaFieldRules.rules) {
        if (rule.disabled) continue
        const triggerFields = new Set(rule.when.flat().map(c => c.field))
        if (triggerFields.size > 0 && ![...triggerFields].some(f => changedFields.has(f))) continue
        const matched = evaluateConditions(rule.when, values, rulesPrevValuesRef.current)
        const effects = matched ? rule.then : rule.else
        effects?.forEach((effect: any) => {
          if (effect.type === 'require' && effect.field) {
            const targets = Array.isArray(effect.field) ? effect.field : [effect.field]
            targets.forEach((f: string) => dynamicRequiredRef.current.add(f))
          }
        })
      }
      rulesPrevValuesRef.current = { ...values }
    }
    onEffect?.(values, methods)
  }, [onEffect, schemaFieldRules])
  // 处理 formSchema，展开 '*' 通配符
  const processedFormSchema = React.useMemo(() => {
    const allPropertyKeys = Object.keys(schema?.properties || {})
    const result: Array<{ key: string, controlType?: string, [key: string]: any }> = []
    const explicitKeys = new Set<string>()

    for (const item of formSchema || []) {
      if (item === '*') {
        // 展开通配符：添加所有未显式指定的字段
        const remainingKeys = allPropertyKeys.filter(key => !explicitKeys.has(key))
        for (const key of remainingKeys) {
          result.push({ key })
        }
      } else {
        // 普通字段项
        result.push(item)
        explicitKeys.add(item.key)
      }
    }

    return result
  }, [schema, formSchema])

  // 预处理 schema：当 type=array 且顶层有 enum 时，将 enum 移入 items
  const preprocessSchema = React.useCallback((schema: any): any => {
    if (!schema?.properties) return schema
    const processed = { ...schema, properties: { ...schema.properties } }
    const requiredKeys: string[] = []
    for (const [key, prop] of Object.entries(processed.properties) as [string, any][]) {
      // need/required → JSON Schema 标准约束
      if (prop?.need || prop?.required) {
        requiredKeys.push(key)
        if (prop?.type === 'string' && prop?.minLength === undefined) {
          processed.properties[key] = { ...prop, minLength: 1 }
        }
        if (prop?.type === 'array' && prop?.minItems === undefined) {
          processed.properties[key] = { ...processed.properties[key], minItems: 1 }
        }
      }
      // enum 从数组顶层移入 items
      if (prop?.type === 'array' && prop?.enum) {
        const { enum: _, ...rest } = processed.properties[key]
        processed.properties[key] = {
          ...rest,
          items: {
            ...(prop.items || {}),
            enum: prop.enum,
          },
        }
      }
    }
    if (requiredKeys.length > 0) {
      processed.required = [...(processed.required || []), ...requiredKeys]
    }
    return processed
  }, [])

  const zodSchema = React.useMemo(() => {
    try {
      return z.fromJSONSchema(preprocessSchema(schema) as any)
    } catch (e) {
      return z.object({})
    }
  }, [schema, preprocessSchema])

  const getMergedSchema = (schema: any, field: string | Record<string, any>) => {
    const fieldKey = typeof field === 'string' ? field : field.key
    const fieldSchema = typeof field === 'string' ? { key: field } : field
    const _fieldKey = fieldKey.includes('.') ? fieldKey.replace('.', '.properties.') : fieldKey
    const baseSchema = get(schema, `properties.${_fieldKey}`)

    // 如果 FormSchemaItem 中有 required 属性，将其转换为 need
    let merged = { ...baseSchema, ...fieldSchema }
    if (typeof field === 'object' && field.required) {
      merged = { ...merged, need: true }
    }

    // editableTable 字段占整行（双列布局）
    if (merged.fieldType === 'editableTable' || merged.controlType === 'editable-table') {
      merged.colSpan = 2
    }

    return { fieldKey, mergedSchema: merged }
  }

  const resolver = React.useMemo<Resolver<any, any>>(() => {
    const zodResolverFn = zodResolver(zodSchema as any)
    return async (values, context, options) => {
      const zodResult = await zodResolverFn(values, context, options)
      // 始终跑 controlType 校验，合并错误
      for (const field of processedFormSchema) {
          const { fieldKey, mergedSchema } = getMergedSchema(schema, field)
          const controlValidate = getControlValidate(mergedSchema)
          if (controlValidate) {
            const error = await controlValidate(values[fieldKey])
            if (error) {
              ;(zodResult.errors as Record<string, unknown>)[fieldKey] = { type: 'validate', message: error }
            }
          }
        }
      // 动态必填（由字段规则 setRequire 设置）
      for (const field of dynamicRequiredRef.current) {
        if (values[field] == null || values[field] === '') {
          ;(zodResult.errors as Record<string, unknown>)[field] = { type: 'required', message: '此字段为必填项' }
        }
      }
      // 字段规则校验（正则 pattern）
      if (schemaFieldRules?.validations?.length) {
        const valErrors = evaluateValidations(schemaFieldRules.validations, values)
        for (const [field, error] of Object.entries(valErrors)) {
          ;(zodResult.errors as Record<string, unknown>)[field] = error
        }
      }
      return zodResult
    }
  }, [zodSchema, processedFormSchema, schema, schemaFieldRules])

  // 从 schema 中提取默认值，与 props.defaultValues 合并（props 优先）
  const schemaDefaults = React.useMemo(() => {
    if (!schema?.properties) return {}
    const defaults: Record<string, unknown> = {}
    for (const [key, prop] of Object.entries(schema.properties) as [string, Record<string, unknown>][]) {
      if (prop?.defaultVal !== undefined) {
        defaults[key] = prop.defaultVal
      }
    }
    return defaults
  }, [schema])

  const methods = useForm({
    resolver: isValid ? resolver : null,
    onEffect: wrappedOnEffect,
    defaultValues: isValid ? { ...schemaDefaults, ...props.defaultValues } : {},
    ...props
  } as any)

  // 在表单挂载后手动调用一次 onEffect，用于初始化字段可见性等
  const hasCalledInitOnEffect = React.useRef(false)

  React.useEffect(() => {
    if (onEffect && schema && !hasCalledInitOnEffect.current) {
      // 获取当前表单的默认值
      const defaultValues = methods.getValues()
      onEffect(defaultValues, methods)
      hasCalledInitOnEffect.current = true
    }
  }, [schema])

  const handleFormSubmit = async (data: any) => {
    onSubmit?.(data)
  }

  return (
    <FormProvider {...methods} classNames={classNames}>
      <form id={formId} noValidate onSubmit={methods.handleSubmit(handleFormSubmit)} className={classNames?.form}>
        <FieldGroup className={classNames?.group} style={classNames?.groupStyle}>
          {processedFormSchema.map(field => {
            const { fieldKey, mergedSchema } = getMergedSchema(schema, field)
            const FieldController = (
              typeof field !== 'string' && field.component
                ? field.component
                : schameConvert
                  ? schameConvert(mergedSchema, field)
                  : formConverter(mergedSchema, field)
            ) as React.ComponentType
            return (
              <FormField name={fieldKey} label={mergedSchema?.title} schema={mergedSchema} required={isValid ? mergedSchema?.need : false} showDescribe={showDescribe}>
                <FieldController />
              </FormField>
            )
          })}
        </FieldGroup>
        {
          children ? (typeof children === 'function' ? children({
            ...methods
          }) : children) : null
        }
      </form>
    </FormProvider>
  )
}

export { SchemaForm }
export default SchemaForm
