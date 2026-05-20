import { useCallback, useMemo, useRef } from 'react'
import type { Resolver, FieldValues } from 'react-hook-form'
import {
  type SchemaFormFieldRules,
  type SchemaFormRule,
  type UseFormReturnExtended,
  applyRules,
  evaluateValidations,
  evaluateConditions,
} from './field-rules-engine'

// ============================================================================
// 编辑器格式类型（用于 convertToSchemaFormRules）
// ============================================================================

/** 编辑器触发条件项 */
export interface ConditionItem {
  field: string
  method: string
  value?: any
}

/** 编辑器交互动作类型 */
export type MutualActionType = 'show' | 'hide' | 'setRequire' | 'setOptional' | 'canEdit' | 'setDisabled' | 'setValue' | 'message'

/** 编辑器交互动作 */
export interface MutualAction {
  type: MutualActionType
  field?: string | string[]
  value?: any
}

/** 编辑器交互规则 */
export interface MutualRule {
  name: string
  key: string
  condition: ConditionItem[][]
  action: MutualAction[]
  disabled?: boolean
}

/** 编辑器字段校验 */
export interface FieldValidation {
  id: string
  field: string
  pattern: string
  message: string
  disabled?: boolean
}

/** 编辑器字段规则（顶层结构） */
export interface FieldRules {
  mutualRules?: MutualRule[]
  validations?: FieldValidation[]
}

// ============================================================================
// 转换：编辑器格式 → 标准格式
// ============================================================================

const ACTION_TYPE_MAP: Record<string, SchemaFormRule['then'][number]['type']> = {
  show: 'show',
  hide: 'hide',
  setRequire: 'require',
  setOptional: 'optional',
  setValue: 'setValue',
  message: 'message',
  canEdit: 'enable',
  setDisabled: 'disable',
}

/**
 * 编辑器 FieldRules → 标准 SchemaFormFieldRules
 */
export function convertToSchemaFormRules(rules: FieldRules): SchemaFormFieldRules {
  return {
    rules: (rules.mutualRules || [])
      .filter(r => !r.disabled)
      .map(rule => ({
        when: (rule.condition || []).map(group =>
          group.map(cond => ({
            field: cond.field,
            op: (cond.method || 'eq') as SchemaFormRule['when'][number][number]['op'],
            value: cond.value,
          }))
        ),
        then: (rule.action || [])
          .map(a => ({
            type: ACTION_TYPE_MAP[a.type] || a.type,
            field: a.field,
            value: a.value,
          })),
      })) as SchemaFormRule[],
    validations: (rules.validations || [])
      .filter(v => !v.disabled && v.field && v.pattern)
      .map(v => ({
        field: v.field,
        pattern: v.pattern,
        message: v.message,
      })),
  }
}

// ============================================================================
// Hook: onEffect 回调
// ============================================================================

/**
 * 创建处理交互规则的 onEffect 回调
 *
 * 防重入策略：setValue 前比较值，相同则跳过 → 自然终止递归，无需时序守卫。
 */
export function useFieldRulesEffect(fieldRules: SchemaFormFieldRules | undefined, schema?: Record<string, any>) {
  const prevValuesRef = useRef<Record<string, any>>({})
  const applyingRef = useRef(false)

  const onEffect = useCallback(
    (values: FieldValues, methods: UseFormReturnExtended) => {
      if (!fieldRules?.rules?.length && !fieldRules?.validations?.length) return
      if (applyingRef.current) return
      applyingRef.current = true
      try {
        if (fieldRules.rules?.length) {
          const changedFields = new Set(
            Object.keys(values).filter(k => values[k] !== prevValuesRef.current[k])
          )
          for (const rule of fieldRules.rules) {
            if (rule.disabled) continue
            const triggerFields = new Set(rule.when.flat().map(c => c.field))
            if (triggerFields.size > 0 && ![...triggerFields].some(f => changedFields.has(f))) continue
            const matched = evaluateConditions(rule.when, values as Record<string, any>, prevValuesRef.current)
            const effects = matched ? rule.then : rule.else
            effects?.forEach(effect => {
              // Silently ignore message effects
            })
          }
          applyRules(fieldRules.rules, values as Record<string, any>, prevValuesRef.current, methods, schema)
        }
        if (fieldRules.validations?.length) {
          const errors = evaluateValidations(fieldRules.validations, values as Record<string, any>)
          for (const [field, error] of Object.entries(errors)) {
            methods.setError(field, error)
          }
          for (const v of fieldRules.validations) {
            if (v.field && !errors[v.field]) {
              const currentError = (methods.formState as any)?.errors?.[v.field]
              if (currentError?.type === 'validate') {
                methods.clearErrors(v.field)
              }
            }
          }
        }
      } finally {
        prevValuesRef.current = { ...methods.getValues() as Record<string, any> }
        applyingRef.current = false
      }
    },
    [fieldRules, schema],
  )

  return onEffect
}

// ============================================================================
// Hook: resolver 包装
// ============================================================================

/**
 * 包装 resolver，叠加字段校验
 */
export function useFieldRulesResolver(
  baseResolver: Resolver<any, any> | undefined,
  fieldRules: SchemaFormFieldRules | undefined,
): Resolver<any, any> | undefined {
  const validations = fieldRules?.validations

  return useMemo(() => {
    if (!baseResolver || !validations?.length) return baseResolver

    return async (values, context, options) => {
      const result = await baseResolver(values, context, options)

      const errors = evaluateValidations(validations, values as Record<string, any>)
      for (const [field, error] of Object.entries(errors)) {
        ;(result.errors as Record<string, unknown>)[field] = error
      }

      return result
    }
  }, [baseResolver, validations])
}
