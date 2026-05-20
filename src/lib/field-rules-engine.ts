export interface UseFormReturnExtended {
  getValues(): Record<string, any>
  setValue(name: string, value: any): void
  setError(name: string, error: { type: string; message: string }): void
  clearErrors(name?: string): void
  setFieldUIState?: (name: string, state: Record<string, any>) => void
  formState?: { errors?: Record<string, { type: string; message: string } | undefined> }
}

// ============================================================================
// 标准类型定义（SchemaForm 消费的通用格式）
// ============================================================================

/** SchemaForm 标准字段规则 */
export interface SchemaFormFieldRules {
  /** 条件规则：满足条件 → 执行效果 */
  rules?: SchemaFormRule[]
  /** 字段校验 */
  validations?: SchemaFormValidation[]
}

/** 单条规则 */
export interface SchemaFormRule {
  /** 触发条件：外层 OR，内层 AND */
  when: SchemaFormCondition[][]
  /** 条件满足时执行 */
  then: SchemaFormEffect[]
  /** 条件不满足时执行（可选，用于反向逻辑） */
  else?: SchemaFormEffect[]
  disabled?: boolean
}

/** 条件项 */
export interface SchemaFormCondition {
  field: string
  op: 'eq' | 'ne' | 'gt' | 'lt' | 'ge' | 'le' | 'in' | 'nin' | 'isNull' | 'notNull' | 'contains' | 'onchange'
  value?: any
}

/** 效果项 */
export interface SchemaFormEffect {
  type: 'show' | 'hide' | 'require' | 'optional' | 'setValue' | 'message' | 'disable' | 'enable'
  field: string | string[]
  value?: any
}

/** 字段校验 */
export interface SchemaFormValidation {
  field: string
  pattern: string
  message: string
}

// ============================================================================
// 条件匹配
// ============================================================================

function matchCondition(cond: SchemaFormCondition, values: Record<string, any>, prevValues: Record<string, any>): boolean {
  const actual = values[cond.field]

  switch (cond.op) {
    case 'eq':      return Array.isArray(cond.value) ? cond.value.includes(actual) : actual == cond.value
    case 'ne':      return Array.isArray(cond.value) ? !cond.value.includes(actual) : actual != cond.value
    case 'gt':      return Number(actual) > Number(cond.value)
    case 'lt':      return Number(actual) < Number(cond.value)
    case 'ge':      return Number(actual) >= Number(cond.value)
    case 'le':      return Number(actual) <= Number(cond.value)
    case 'in':      return Array.isArray(cond.value) && cond.value.includes(actual)
    case 'nin':     return Array.isArray(cond.value) && !cond.value.includes(actual)
    case 'isNull':  return actual == null || actual === ''
    case 'notNull': return actual != null && actual !== ''
    case 'contains': return String(actual ?? '').includes(String(cond.value ?? ''))
    case 'onchange': return actual !== prevValues[cond.field]
    default:        return true
  }
}

/**
 * 评估条件组（外层 OR，内层 AND）
 */
export function evaluateConditions(
  groups: SchemaFormCondition[][],
  values: Record<string, any>,
  prevValues: Record<string, any>,
): boolean {
  if (!groups?.length) return true
  return groups.some(group =>
    group.every(cond => matchCondition(cond, values, prevValues))
  )
}

// ============================================================================
// 效果执行
// ============================================================================

function coerceValue(value: any, fieldType?: string): any {
  if (value == null) return value
  if (fieldType === 'number' || fieldType === 'int' || fieldType === 'double') {
    const n = Number(value)
    return isNaN(n) ? value : n
  }
  if (fieldType === 'boolean') {
    if (value === 'true') return true
    if (value === 'false') return false
    return Boolean(value)
  }
  return value
}

/**
 * 解析模板值，支持 {{fieldName}} 占位符
 *
 * 示例：
 *   "{{a}} + {{b}}"     → 数值运算: a=1, b=2 → 3
 *   "{{a}} * {{b}}"     → 数值运算: a=10, b=3 → 30
 *   "{{a}}{{b}}"         → 字符串拼接: a="hello", b="world" → "helloworld"
 *   "前缀-{{a}}-后缀"    → 混合: a=1 → "前缀-1-后缀"
 *   "{{a}}"              → 简单引用: a=222 → "222"
 */
function resolveEffectValue(template: any, values: Record<string, any>): any {
  if (typeof template !== 'string' || !template.includes('{{')) {
    return template
  }

  const resolved = template.replace(/\{\{([^}]+)\}\}/g, (_, fieldPath) => {
    const path = fieldPath.trim()
    const val = path.split('.').reduce((obj: any, key: string) => obj?.[key], values)
    return val == null ? '' : String(val)
  })

  const trimmed = resolved.trim()
  if (/[\+\-\*\/]/.test(trimmed) && /^[\d\s+\-*/().]+$/.test(trimmed)) {
    try {
      return new Function(`return (${trimmed})`)()
    } catch {
      return resolved
    }
  }

  return resolved
}

function applyEffect(
  effect: SchemaFormEffect,
  methods: UseFormReturnExtended,
  _values: Record<string, any>,
  schema?: Record<string, any>,
) {
  const targets = Array.isArray(effect.field) ? effect.field : effect.field ? [effect.field] : []
  const setUI = methods.setFieldUIState

  switch (effect.type) {
    case 'show':
      targets.forEach(f => setUI?.(f, { visible: true }))
      break
    case 'hide':
      targets.forEach(f => setUI?.(f, { visible: false }))
      break
    case 'require':
      targets.forEach(f => setUI?.(f, { required: true }))
      break
    case 'optional':
      targets.forEach(f => setUI?.(f, { required: false }))
      break
    case 'disable':
      targets.forEach(f => setUI?.(f, { disabled: true }))
      break
    case 'enable':
      targets.forEach(f => setUI?.(f, { disabled: false }))
      break
    case 'setValue':
      targets.forEach(f => {
        if (effect.value !== undefined) {
          const resolvedValue = resolveEffectValue(effect.value, methods.getValues())
          const currentValue = methods.getValues()[f]
          const fieldType = schema?.properties?.[f]?.type as string | undefined
          const newValue = coerceValue(resolvedValue, fieldType)
          if (currentValue !== newValue) {
            methods.setValue(f, newValue)
          }
        }
      })
      break
    case 'message':
      if (effect.value) {
        if (targets.length > 0) {
          targets.forEach(f => methods.setError(f, { type: 'message', message: String(effect.value) }))
        }
      }
      break
  }
}

/**
 * 应用所有规则
 *
 * 只在触发字段（条件中的字段）发生变化时才求值规则，
 * 避免用户修改目标字段时被规则强行覆盖。
 */
export function applyRules(
  rules: SchemaFormRule[],
  values: Record<string, any>,
  prevValues: Record<string, any>,
  methods: UseFormReturnExtended,
  schema?: Record<string, any>,
) {
  const changedFields = new Set(
    Object.keys(values).filter(k => values[k] !== prevValues[k])
  )

  for (const rule of rules) {
    if (rule.disabled) continue

    const triggerFields = new Set(rule.when.flat().map(c => c.field))

    if (triggerFields.size > 0 && ![...triggerFields].some(f => changedFields.has(f))) {
      continue
    }

    const matched = evaluateConditions(rule.when, values, prevValues)
    const effects = matched ? rule.then : rule.else
    effects?.forEach(effect => applyEffect(effect, methods, values, schema))
  }
}

// ============================================================================
// 校验执行
// ============================================================================

/**
 * 执行字段校验，返回错误映射
 */
export function evaluateValidations(
  validations: SchemaFormValidation[],
  values: Record<string, any>,
): Record<string, { type: string; message: string }> {
  const errors: Record<string, { type: string; message: string }> = {}

  for (const v of validations) {
    if (!v.field || !v.pattern) continue
    const actual = values[v.field]
    if (actual == null || actual === '') continue
    try {
      if (!new RegExp(v.pattern).test(String(actual))) {
        errors[v.field] = { type: 'validate', message: v.message || '格式不正确' }
      }
    } catch {
      // 无效正则，跳过
    }
  }

  return errors
}
