import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { NullInput, TextInput, VariateRangeTimeInput, getMethods, type MethodItem } from '@/components/kesi/query-editor-methods/query-editor-methods'
import { convertProps } from '@/lib/query-editor-util'
import { formConverter } from '@/lib/view-form-converter'
import { filterConverter } from '@/lib/view-filter-converter'
import { formFieldConverter } from '@/lib/form-field-converter'
import { FormProvider, useForm, } from '@airiot/client'
import isNil from 'lodash/isNil'
import omit from 'lodash/omit'
import get from 'lodash/get'
import set from 'lodash/set'
import find from 'lodash/find'
import isEmpty from 'lodash/isEmpty'
import cloneDeep from 'lodash/cloneDeep'

// --- Type Definitions ---

/** Query condition value */
interface QueryCondition {
  field?: string
  method?: string
  value?: unknown
  timeRange?: {
    rangeType?: string
    type?: string
    count?: number | null
    unit?: string
    fromNow?: boolean
    [key: string]: unknown
  }
  valid?: boolean
}

/** Related field definition */
interface RelateField {
  key: string
  title?: string
  label?: string
  fieldSchema?: FieldSchema
}

/** Field schema definition */
interface FieldSchema {
  key: string
  id?: string
  type?: string
  controlType?: string
  format?: string
  timeFormat?: string
  formatType?: string
  enum?: unknown[]
  enum1?: unknown[]
  title?: string
  name?: string
  relateTo?: string
  relate?: {
    fields?: RelateField[]
  }
  relateShowFields?: RelateField[]
  component?: React.ComponentType
  selectType?: string
  selectFace?: string
  config?: string
  userType?: string
  fieldType?: string
  filterByRes?: unknown
  filterMethodFn?: (methods: MethodItem[]) => MethodItem[]
  field?: { component?: string }
  [key: string]: unknown
}

/** Schema definition */
interface SchemaDef {
  properties: Record<string, FieldSchema>
  formSchema?: FormSchemaItem[]
  form?: string[] | string
  name?: string
}

/** Form schema item */
interface FormSchemaItem {
  key: string
  [key: string]: unknown
}

/** Property item from convertProps */
interface PropItem {
  key: string
  title?: string
  id?: string
  name?: string
  type?: string
  controlType?: string
  config?: string
  relate?: { fields?: RelateField[] }
  relateShowFields?: RelateField[]
  selectType?: string
  component?: React.ComponentType
  enum?: unknown[]
  enum1?: unknown[]
  [key: string]: unknown
}

// --- BindDataWrap Component ---

const BindDataWrap = ({
  children,
  DataWrap,
  selectMethod,
  ...restProps
}: {
  children: React.ReactNode
  DataWrap?: React.ComponentType<any>
  selectMethod?: string
  [key: string]: unknown
}) => {
  if (['isNull', 'notNull'].indexOf(selectMethod || '') > -1) {
    // 为空，不为空，不渲染 DataWrap
    return null
  }

  return DataWrap ? (
    <DataWrap {...restProps}>{children}</DataWrap>
  ) : (
    children
  )
}

// --- Interfaces ---

interface QueryItemFromProps {
  value: QueryCondition
  schema: SchemaDef
  fieldKey: string
  onChange: (value: QueryCondition) => void
  timeRangeQuery?: boolean
  DataWrap?: React.ComponentType
  showValidBtn?: boolean
  relation?: string
  ifOnlyOr?: boolean
  allowAndOp?: boolean
  selectHide?: boolean
  fieldPlaceholder?: string
  btnName?: string
  onlyOneType?: boolean
}

const getFieldCom = (fSchema: FieldSchema, method: MethodItem | undefined) => {
  let FieldController
  const fieldSchame = { key: fSchema.key }
  if (!fSchema.controlType && !fSchema.relateTo && !fSchema.relate && !fSchema.enum && !fSchema.enum1) return
  if (method?.type == 'multipleSelect') {
    if (fSchema.type == 'array') {
      FieldController = formConverter(fSchema, fieldSchame)
    } else {
      const schema = { type: 'object', properties: { [fSchema.key]: { ...fSchema, name: fSchema.key } } }
      const multipleSchema = { items: schema, ...fSchema, selectType: 'multiple', type: 'array' }
      if (fSchema.enum) {
        fSchema.controlType = fSchema.type == 'number' ? 'select-array-number' : 'select-array-string'
      } else if (fSchema.controlType == 'relate') {
        fSchema.controlType = 'relate-multiple'
      }
      FieldController = formConverter(multipleSchema, fieldSchame)
    }
  } else if (fSchema.type == 'object' && ['eq', 'ne'].indexOf(method?.key || '') > -1 && (fSchema.relateTo || fSchema.relate)) {
    FieldController = formConverter(fSchema, fieldSchame)
  } else {
    FieldController = fSchema?.type == 'array' ? filterConverter(fSchema, fieldSchame) : formConverter(fSchema, fieldSchame)
  }  
  return ({ value, onChange }: { value?: any, onChange?: (v: any) => void }) => {
    const methods = useForm()
    const field = formFieldConverter(fSchema)
    
    return (
      <FormProvider {...methods}>
        <FieldController {...field} value={value} onChange={onChange} />
      </FormProvider>
    )
  }
}

const getConvertCom = (fieldSchema: FieldSchema, method: MethodItem | undefined): React.ComponentType | undefined => {
  if (!method) return NullInput
  const FieldTypeCom = getFieldCom(fieldSchema, method)
  if (fieldSchema?.selectFace) fieldSchema.selectFace = 'select'
  if (method?.useCustomCom || method?.key == 'isNull' || method?.key == 'notNull') {
    return method.component
  }
  if (fieldSchema?.controlType == 'select-number') {
    return (method?.key == 'range' || method?.key == 'notRange') ? method.component : FieldTypeCom
  }
  if (method?.key == 'eq' || method?.key == 'ne') {
    if (fieldSchema.component) {
      return fieldSchema.component
    } else if (fieldSchema?.format || fieldSchema?.timeFormat || fieldSchema?.controlType === 'text' || fieldSchema?.type === 'boolean') {
      return method.component
    }
    return FieldTypeCom || method.component
  }
  if (method?.type == 'multipleSelect' && ['in', 'nin'].indexOf(method?.key) > -1) {
    return FieldTypeCom || fieldSchema.component || method?.component || TextInput
  }
  if (fieldSchema.controlType && (fieldSchema.enum || fieldSchema.enum1) || fieldSchema.relateTo || fieldSchema.controlType === 'area') {
    return fieldSchema.component || FieldTypeCom || TextInput
  }
  if (method?.type == 'multipleSelect' && fieldSchema.type == 'array') {
    return fieldSchema.component || method?.component || FieldTypeCom || (fieldSchema.field?.component as unknown as React.ComponentType) || TextInput
  }
  return fieldSchema.component || method?.component || FieldTypeCom || TextInput
}

const ValueComponent = ({ method, fieldSchema, fieldKey, ...restProps }: {
  method?: MethodItem
  fieldSchema: FieldSchema
  fieldKey: string
  value?: unknown
  onChange?: (v: unknown) => void
  label?: string
  schema?: FieldSchema
}) => {

  const Com = () => getConvertCom(fieldSchema, method) || TextInput
  const [FieldComponent, setFieldComponent] = useState<React.ComponentType<Record<string, any>>>(Com)
  React.useEffect(() => {
    setFieldComponent(Com)
  }, [fieldKey, method])

  const Comp = FieldComponent || NullInput
  return <Comp schema={fieldSchema} {...restProps} />
}

const QueryItemFrom = ({ value, schema, fieldKey, onChange, timeRangeQuery, DataWrap, showValidBtn }: QueryItemFromProps) => {
  const [methods, setMethods] = useState<MethodItem[]>()
  const [isTime, setIsTime] = useState<boolean>()
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [rangeType, setRangeTypeState] = useState(value?.timeRange?.rangeType)

  const selectMethod = value?.method ?? undefined
  const isRange = ['range', 'notRange'].indexOf(selectMethod as string) > -1

  const setRangeType = (v: string) => {
    setRangeTypeState(v)
    if (isRange) {
      onChange({ ...value, timeRange: { rangeType: v } })
    } else {
      const val = v == 'fixed' ? null : v
      onChange({ ...value, value: val, timeRange: { rangeType: v } })
    }
  }

  // 监听容器宽度变化
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.getBoundingClientRect().width ||
          containerRef.current.offsetWidth ||
          containerRef.current.clientWidth
        setContainerWidth(width)
      }
    }

    // 初始获取宽度
    const timer = setTimeout(updateWidth, 0)

    // ResizeObserver 监听后续变化
    let observer: ResizeObserver | undefined
    if (window.ResizeObserver) {
      observer = new ResizeObserver(entries => {
        if (entries[0]) {
          setContainerWidth(entries[0].contentRect.width)
        }
      })

      if (containerRef.current) {
        observer.observe(containerRef.current)
      }
    }

    // 窗口大小变化时也更新
    window.addEventListener('resize', updateWidth)

    return () => {
      clearTimeout(timer)
      if (observer) observer.disconnect()
      window.removeEventListener('resize', updateWidth)
    }
  }, [])

  // 添加 useLayoutEffect 确保在 DOM 更新后立即获取尺寸
  useLayoutEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.getBoundingClientRect().width
      if (width > 0) {
        setContainerWidth(width)
      }
    }
  })

  // 检查是否为关联字段的子字段（格式为 "parentField.childField"）
  const isNestedField = fieldKey.includes('.')
  let fieldSchema: FieldSchema = { key: fieldKey }

  if (isNestedField) {
    // 解析父字段和子字段
    const [parentKey, childKey] = fieldKey.split('.')
    const parentSchema = schema.properties[parentKey]

    // 从父字段的 relate.fields 和 relateShowFields 中查找子字段
    let childField: RelateField | null = null

    // 先从 relate.fields 中查找
    if (parentSchema?.relate?.fields) {
      childField = parentSchema.relate.fields.find((field: RelateField) => field.key === childKey) || null
    }

    // 如果在 relate.fields 中没找到，则从 relateShowFields 中查找
    if (!childField && parentSchema?.relateShowFields) {
      childField = parentSchema.relateShowFields.find((field: RelateField) => field.key === childKey) || null
    }

    // 如果找到了子字段，使用其 fieldSchema
    if (childField) {
      fieldSchema = childField.fieldSchema || { key: childKey }
    }
  } else {
    // 对于非嵌套字段，使用原来的逻辑
    const f = fieldKey.replace('.', '.properties.')
    fieldSchema = (omit(get(schema.properties, f), 'filterByRes') || { key: fieldKey }) as FieldSchema
  }

  const defaultType = isRange ? 'fixed' : null

  const ops = ['range', 'notRange'].indexOf(selectMethod as string) > -1
    ? [{ label: '固定范围', value: 'fixed' }, { label: '变化范围', value: 'dynamic' }]
    : [{ label: '固定时间', value: 'fixed' }, { label: '今天', value: 'nowinstant d' }, { label: '明天', value: 'nowinstant + 1d' }, { label: '昨天', value: 'nowinstant - 1d' }]

  useEffect(() => {
    // 对于嵌套字段，我们需要根据子字段的 fieldSchema 获取合适的方法
    if (isNestedField) {
      const [parentKey, childKey] = fieldKey.split('.')
      const parentSchema = schema.properties[parentKey]

      if (parentSchema?.config === "关联字段") {
        // 为关联字段的子字段确定适当的方法
        const ms = getMethods({ properties: { [childKey]: fieldSchema } }, childKey)
        setMethods(ms)

        // 检查是否为时间字段
        if (['date', 'datetime', 'date-time'].includes(fieldSchema?.format || '') || fieldSchema?.controlType === 'date') {
          setIsTime(true)
        }
      } else {
        // 如果不是标准的关联字段格式，回退到原始实现
        const ms = getMethods(schema, fieldKey)
        setMethods(ms)
        if (['date', 'datetime', 'date-time'].includes(schema.properties[fieldKey]?.format || '') || schema.properties[fieldKey]?.controlType == 'date') setIsTime(true)
      }
    } else {
      // 非嵌套字段使用原始逻辑
      const ms = getMethods(schema, fieldKey)
      setMethods(ms)
      if (['date', 'datetime', 'date-time'].includes(schema.properties[fieldKey]?.format || '') || schema.properties[fieldKey]?.controlType == 'date') setIsTime(true)
    }
  }, [schema, fieldKey])

  const onMethodChange = (key: string) => {
    onChange({ ...omit(value, 'timeRange'), method: key, value: null })
  }

  const onValueChange = (v: unknown) => {
    onChange({ ...value, value: (v as { target?: { value?: unknown } })?.target ? (v as { target: { value: unknown } }).target.value : v })
  }

  const onTimeRangeChange = (timeRange: unknown, v: unknown) => {
    onChange({ ...value, timeRange: timeRange as QueryCondition['timeRange'], value: v })
  }

  const onValidChange = (v: boolean) => {
    onChange({ ...value, valid: v })
  }

  const method = find(methods, m => m.key == selectMethod) || (methods && methods[0])
  const type = schema?.properties?.[fieldKey]?.type

  // 根据容器宽度决定布局方式
  const isNarrowLayout = containerWidth > 0 && containerWidth < 300
  const field = schema.formSchema?.find((s: FormSchemaItem) => s.key == fieldKey)
  const megerSchema = { ...fieldSchema, ...field } as FieldSchema

  return (
    isEmpty(methods) ? null :
      <div ref={containerRef} className={isNarrowLayout ? 'mb-4' : ''}>
        {isNarrowLayout ? (
          // 窄屏布局：三行显示
          <>
            <div className="w-full mb-2">
              <Select
                value={selectMethod || ''}
                onValueChange={onMethodChange}
              >
                <SelectTrigger className="w-full min-w-32.5">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  {(methods || []).map(m => {
                    return <SelectItem key={m.key} value={m.key}>{m.name}</SelectItem>
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectMethod ?
              <>
                <div className="mb-2 w-full">
                  {
                    ['range', 'notRange', 'gt', 'lt'].indexOf(selectMethod as string) > -1 && timeRangeQuery && isTime ?
                      <Select value={rangeType || defaultType || ''} onValueChange={setRangeType}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="请选择" />
                        </SelectTrigger>
                        <SelectContent>
                          {ops.map(op => <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>)}
                        </SelectContent>
                      </Select> :
                      <BindDataWrap input={{ value: value?.value, onChange: onValueChange }} field={megerSchema} DataWrap={DataWrap} selectMethod={selectMethod}>
                        <div className="w-full">
                          <ValueComponent method={method} fieldKey={fieldKey} value={value?.value} onChange={onValueChange} fieldSchema={megerSchema} label={fieldSchema.title} />
                        </div>
                      </BindDataWrap>
                  }
                </div>

                {showValidBtn ?
                  <div className="mb-2">
                    <BindDataWrap input={{ value: value?.valid, onChange: onValidChange }} field={{ title: '生效', type: 'boolean' }} DataWrap={DataWrap} selectMethod={selectMethod}>
                      <Switch
                        checked={isNil(value?.valid) || value?.valid}
                        onCheckedChange={onValidChange}
                      />
                    </BindDataWrap>
                  </div>
                  : null}
              </>
              : null}
          </>
        ) : (
          // 宽屏布局：原来的两行显示
          <>
            <div className="w-full flex flex-row mb-2">
              <Select
                value={selectMethod || ''}
                onValueChange={onMethodChange}
              >
                <SelectTrigger
                  className="mr-2 w-25 h-auto min-w-32.5 shrink-0"
                >
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  {(methods || []).map(m => {
                    return <SelectItem key={m.key} value={m.key}>{m.name}</SelectItem>
                  })}
                </SelectContent>
              </Select>
              {selectMethod ?
                <div className="flex flex-wrap grow gap-2 items-center">
                  <div className={`
                    grow
                    ${['isNull', 'notNull'].indexOf(selectMethod as string) === -1 && type !== 'boolean' ? 'min-w-50 flex-basis-50' : 'min-w-auto flex-basis-auto'}
                  `}>
                    {
                      ['range', 'notRange', 'gt', 'lt'].indexOf(selectMethod as string) > -1 && timeRangeQuery && isTime ?
                        <Select value={rangeType || defaultType || ''} onValueChange={setRangeType}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="请选择" />
                          </SelectTrigger>
                          <SelectContent>
                            {ops.map(op => <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>)}
                          </SelectContent>
                        </Select> :
                        <BindDataWrap input={{ value: value?.value, onChange: onValueChange }} field={megerSchema} DataWrap={DataWrap} selectMethod={selectMethod}>
                          <ValueComponent method={method} fieldKey={fieldKey} value={value?.value} onChange={onValueChange} fieldSchema={megerSchema} />
                        </BindDataWrap>
                    }
                  </div>
                  {showValidBtn ?
                    <div className="shrink-0 min-w-15">
                      <BindDataWrap input={{ value: value?.valid, onChange: onValidChange }} field={{ title: '生效', type: 'boolean' }} DataWrap={DataWrap} selectMethod={selectMethod}>
                        <Switch
                          checked={isNil(value?.valid) || value?.valid}
                          onCheckedChange={onValidChange}
                        />
                      </BindDataWrap>
                    </div>
                    : null}
                </div>
                : null}
            </div>
          </>
        )}

        {
          ['range', 'notRange', 'gt', 'lt'].indexOf(selectMethod as string) > -1 && timeRangeQuery && isTime &&
          (rangeType == 'dynamic' ? <VariateRangeTimeInput {...fieldSchema} value={value?.timeRange} onChange={onTimeRangeChange}></VariateRangeTimeInput> :
            rangeType == 'fixed' || defaultType == 'fixed' ?
              <div className="mb-2">
                <BindDataWrap input={{ value: value?.value, onChange: onValueChange }} field={megerSchema} DataWrap={DataWrap} selectMethod={selectMethod}>
                  <ValueComponent method={method} fieldKey={fieldKey} value={value?.value} onChange={onValueChange} fieldSchema={megerSchema} />
                </BindDataWrap>
              </div> : null)
        }
      </div>
  )
}

const getType = (item: Record<string, unknown>): string => {
  // 工作表显示字段类型，不显示数据类型
  if (item.config) return item.config as string
  const typeList: Record<string, string> = { string: '字符串', number: '数字', integer: '整数', boolean: '布尔', object: '对象', array: '数组' }
  return typeList[item.type as string] || '字符串'
}

interface QueryFieldSelectProps {
  schema: SchemaDef
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const QueryFieldSelect = ({ schema, value, onChange, placeholder }: QueryFieldSelectProps) => {
  const properties = schema?.properties ? convertProps(schema.properties, schema.form) : []
  const ops = (properties as PropItem[]).filter((item) => item.key != 'model' && item.key != 'dashboard' && item.controlType !== 'editable-table')

  // Handle field selection, supporting nested selections
  const handleFieldChange = (selectedValue: string) => {
    onChange(selectedValue)
  }

  return (
    <Select
      value={value || ''}
      onValueChange={handleFieldChange}
    >
      <SelectTrigger className="mr-2 grow">
        <SelectValue placeholder={placeholder || "选择过滤字段"} />
      </SelectTrigger>
      <SelectContent>
        {ops.map((item: PropItem) => {
          const key = item.key || item.id || ''
          const title = item.title || item.name

          // Check if this is a relate field
          if (item.config === "关联字段" && item.selectType !== 'multiple' && (item.relate?.fields?.length || item.relateShowFields?.length)) {
            return (
              <React.Fragment key={key}>
                {/* 保留关联字段本身作为一级选择 */}
                <SelectItem value={key}>
                  <span className="text-muted-foreground">[{getType(item)}]</span> {title}
                </SelectItem>

                {/* Add options from relate.fields with indentation */}
                {(item.relate?.fields || []).map((relateField: RelateField) => {
                  const relateKey = `${key}.${relateField.key}`
                  return (
                    <SelectItem key={relateKey} value={relateKey}>
                      <span className="pl-5">
                        <span className="text-muted-foreground">[{getType(relateField.fieldSchema || {})}]</span> {relateField.title}
                      </span>
                    </SelectItem>
                  )
                })}

                {/* Add options from relateShowFields with indentation */}
                {(item.relateShowFields || []).map((relateField: RelateField) => {
                  const relateKey = `${key}.${relateField.key}`
                  // Check if this field is already included in relate.fields
                  const isDuplicate = item.relate?.fields?.some((f: RelateField) => f.key === relateField.key)
                  // 处理relateField.fieldSchema为空时显示错误问题
                  if (!isDuplicate && relateField?.fieldSchema) {
                    return (
                      <SelectItem key={relateKey} value={relateKey}>
                        <span className="pl-5">
                          <span className="text-muted-foreground">[{getType(relateField.fieldSchema)}]</span> {relateField.title || relateField.label}
                        </span>
                      </SelectItem>
                    )
                  }
                  return null
                })}
              </React.Fragment>
            )
          }

          // Return regular option for non-related fields
          if (!key || !title) return null
          return (
            <SelectItem key={key} value={key}>
              <span className="text-muted-foreground">[{getType(item)}]</span> {title}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

interface QueryItemProps {
  value: QueryCondition
  schema: SchemaDef
  onChange: (value: QueryCondition) => void
  onDelete: () => void
  selectHide?: boolean
  fieldPlaceholder?: string
  timeRangeQuery?: boolean
  DataWrap?: React.ComponentType
  showValidBtn?: boolean
  relation?: string
  ifOnlyOr?: boolean
  allowAndOp?: boolean
}

const QueryItem = (props: QueryItemProps) => {
  const { value, schema, onChange, onDelete, selectHide, fieldPlaceholder } = props

  return (
    <>
      {selectHide ? null : (
        <div className="w-full flex flex-row items-center mb-2">
          <QueryFieldSelect schema={schema} value={value?.field || ''} onChange={(field) => onChange({ field })} placeholder={fieldPlaceholder} />
          <div className="ml-2 shrink-0">
            <button
              type="button"
              onClick={onDelete}
              className="hover:text-destructive transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {value?.field ? <QueryItemFrom {...props} fieldKey={value?.field} /> : null}
    </>
  )
}

interface QueryFormProps {
  query: QueryCondition[]
  schema: SchemaDef
  onChange: (query: QueryCondition[]) => void
  relation?: string
  ifOnlyOr?: boolean
  allowAndOp?: boolean
  selectHide?: boolean
  fieldPlaceholder?: string
  timeRangeQuery?: boolean
  DataWrap?: React.ComponentType
  showValidBtn?: boolean
}

const QueryForm = (props: QueryFormProps) => {
  const { query, schema, onChange, relation, ifOnlyOr } = props

  let error: Record<string, string> = {}

  const onItemChange = (i: number) => (value: QueryCondition) => {
    const f = (value.field || '').replace('.', '.properties.')
    if (get(schema.properties, f)?.type == 'boolean') {
      if (isNil(value?.value)) {
        value['value'] = true
      }
    }
    onChange([
      ...query.slice(0, i),
      value,
      ...query.slice(i + 1)
    ])
  }

  const onItemDelete = (i: number) => () => {
    onChange([
      ...query.slice(0, i),
      ...query.slice(i + 1)
    ])
  }

  const onAddQuery = () => {
    onChange([...query, {}])
  }

  // 使用 findLastIndex 的替代方案
  const getErrorIndex = () => {
    for (let i = query.length - 1; i >= 0; i--) {
      if (query[i]?.field && error[query[i].field || '']) {
        return i
      }
    }
    return -1
  }

  return (
    <>
      {query.map((item, i) => {
        const errorIndex = error[item.field || ''] ? getErrorIndex() : -1
        const key = item.field ? (item.field + (item.method || '') + i) : i
        return (
          <span key={key}>
            <QueryItem {...props} onChange={onItemChange(i)} onDelete={onItemDelete(i)} value={item} />
            {errorIndex == i && <div className="text-xs text-destructive">{error[item.field || '']}</div>}
            {(!relation || relation == 'and') && !ifOnlyOr ?
              i == query.length - 1 ? (
                <Button type="button" onClick={onAddQuery}>+ {'且'}</Button>
              ) : (
                <div className="mx-4 mb-2">{'且'}</div>
              ) : null}
          </span>
        )
      })}
    </>
  )
}

interface QueryEditorProps {
  value?: QueryCondition[][]
  onChange?: (value: QueryCondition[][]) => void
  relation?: string
  style?: React.CSSProperties
  DataWrap?: React.ComponentType
  btnName?: string
  onlyOneType?: boolean
  schema: SchemaDef
  selectHide?: boolean
  fieldPlaceholder?: string
  timeRangeQuery?: boolean
  showValidBtn?: boolean
  allowAndOp?: boolean
}

/**
 * QueryEditor 组件
 * @description 查询编辑器组件，用于构建复杂的查询条件
 *
 * @param input - 输入值和变更回调
 * @param relation - 逻辑关系 ('and' | 'or')
 * @param style - 自定义样式
 * @param btnName - 按钮名称
 * @param onlyOneType - 只能且和或二选一
 * @param schema - 数据模型 schema
 * @param selectHide - 隐藏字段选择
 * @param fieldPlaceholder - 字段占位符
 * @param timeRangeQuery - 时间范围查询
 * @param showValidBtn - 显示生效失效按钮
 * @param allowAndOp - 允许且操作
 */
const QueryEditor = (props: QueryEditorProps) => {
  const { value = [], onChange, relation, style, btnName, onlyOneType, schema } = props
  const [queries, setQueries] = useState(value)

  const saveQueries = (qs: QueryCondition[][]) => {
    const filtered = qs.filter(q => !isEmpty(q))
    setQueries(filtered)
    onChange && onChange(filtered)
  }

  useEffect(() => {
    setQueries(value || [])
  }, [value])

  const addQuery = useCallback((i: number) => {
    const query = queries[i] || []
    const newQuery = [
      ...query,
      { field: '' }
    ]
    saveQueries([...set(queries, i, newQuery)])
  }, [queries])

  const onAddOrQuery = useCallback(() => {
    saveQueries([
      ...queries,
      [{}]
    ])
  }, [queries])

  const setQuery = (i: number) => (query: QueryCondition[]) => {
    const newQuerys = cloneDeep(queries)
    if (newQuerys?.length) newQuerys[i] = query
    if (isEmpty(query)) {
      saveQueries([...queries.slice(0, i), ...queries.slice(i + 1)])
    } else {
      saveQueries(newQuerys)
    }
  }

  if (schema?.name == "warning") {
    schema.properties['recoveryTime'] = {
      key: 'recoveryTime',
      title: '报警恢复时间',
      type: 'string',
      format: "date-time"
    }
  }
  if (isEmpty(queries)) {
    return <Button type="button" onClick={() => addQuery(0)}>{btnName || '添加过滤条件'}</Button>
  } else {
    const ifOnlyAnd = onlyOneType && queries[0]?.length > 1 // 只使用且，不用或
    const ifOnlyOr = onlyOneType && queries.length > 1 // 只使用或，不用且
    return queries.map((query, i) => {
      return (
        <div key={i} style={style}>
          <QueryForm
            {...props}
            schema={schema}
            query={query}
            onChange={setQuery(i)}
            ifOnlyOr={ifOnlyOr}
          />
          {(!relation || relation == 'or') && !ifOnlyAnd ?
            i == queries.length - 1 ? (
              <Button style={{ marginLeft: '0.5rem' }} type="button" onClick={onAddOrQuery}>+ {'或'}</Button>
            ) : (
              <div className="flex items-center my-2">
                <Separator className="flex-1" />
                <span className="px-2 text-sm text-muted-foreground">{'或'}</span>
                <Separator className="flex-1" />
              </div>
            )
            : null
          }
        </div>
      )
    })
  }
}

export { QueryEditor, QueryItem, QueryForm, QueryFieldSelect, QueryItemFrom }
