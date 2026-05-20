import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { TimePicker } from '@/components/ui/time-picker'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { X, CalendarIcon } from 'lucide-react'
import dayjs from 'dayjs'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { format } from 'date-fns'
import isNil from 'lodash/isNil'
import omit from 'lodash/omit'
import get from 'lodash/get'
import find from 'lodash/find'
import isArray from 'lodash/isArray'
import { FilterDatetime } from '@/components/kesi/filter-datetime/filter-datetime'
import { FilterDate } from '@/components/kesi/filter-date/filter-date'
import { convertProps } from '@/lib/query-editor-util'

// --- Type Definitions ---

interface FilterFieldSchema {
  enum?: string[]
  enum1?: string[]
  enum_title?: string[]
  enum_title1?: string[]
  enumNames?: string[]
  format?: string
  formatType?: string
  timeFormat?: string
}

interface RangeInputValue {
  gte?: number | string
  lte?: number | string
}

interface VariateRangeTimeValue {
  type?: string
  count?: number | null
  unit?: string
  fromNow?: boolean
}

interface MethodItem {
  name: string
  key: string
  component?: React.ComponentType
  type?: string
  useCustomCom?: boolean
}

interface EnumInputProps {
  value?: string | { $in?: string[]; in?: string[] } | string[]
  onChange?: (value: string | string[]) => void
  schema?: FilterFieldSchema
  mode?: string
}

interface PropItem {
  key?: string
  id?: string
  type?: string
  selectType?: string
  format?: string
  timeFormat?: string
  controlType?: string
  related?: string
  relateTo?: string
  relate?: string
  enum?: unknown[]
  enum1?: unknown[]
  field?: { component?: string }
  component?: string
  filterMethodFn?: (methods: MethodItem[]) => MethodItem[]
  [key: string]: unknown
}

interface FilterSchema {
  properties?: Record<string, unknown>
  formSchema?: PropItem[]
}

// --- Components ---

const NullInput = () => null

// 文本输入组件（支持多标签）
const TextInput = ({ value, onChange, placeholder }: { value?: string | string[]; onChange?: (value: string[]) => void; placeholder?: string }) => {
  const initialValue = Array.isArray(value) ? value : (value ? [value] : [])
  const [inputValue, setInputValue] = useState('')
  const [tags, setTags] = useState<string[]>(initialValue)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleChange = (newTags: string[]) => {
    setTags(newTags)
    onChange?.(newTags)
  }

  const addTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      handleChange([...tags, inputValue.trim()])
      setInputValue('')
      setShowSuggestion(false)
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    handleChange(tags.filter(tag => tag !== tagToRemove))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setShowSuggestion(value.trim() !== '' && !tags.includes(value.trim()))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim() && !tags.includes(inputValue.trim())) {
      e.preventDefault()
      e.stopPropagation()
      addTag()
      // 失焦后重新聚焦
      setTimeout(() => {
        inputRef.current?.blur()
        inputRef.current?.focus()
      }, 50)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      handleChange(tags.slice(0, -1))
    } else if (e.key === 'Escape') {
      setShowSuggestion(false)
    }
  }

  const handleBlur = () => {
    // 延迟处理以允许点击建议项
    setTimeout(() => {
      if (!wrapperRef.current?.contains(document.activeElement)) {
        setShowSuggestion(false)
      }
    }, 150)
  }

  return (
    <div ref={wrapperRef} className="relative w-full min-w-0">
      <div className="flex flex-wrap items-center gap-1 w-full min-w-0 border rounded-md px-2 py-1 bg-background">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="hover:bg-destructive/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.trim() && !tags.includes(inputValue.trim())) {
              setShowSuggestion(true)
            }
          }}
          placeholder={placeholder || "请输入"}
          className="flex-1 min-w-20 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-7 shadow-none"
        />
      </div>
      {showSuggestion && inputValue.trim() && !tags.includes(inputValue.trim()) && (
        <div
          className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground shadow-md rounded-md border p-2 cursor-pointer hover:bg-accent"
          onClick={addTag}
        >
          使用 "{inputValue}"
        </div>
      )}
    </div>
  )
}

// 数字输入组件
const NumberInput = ({ value, onChange }: { value?: number; onChange?: (value: number | null) => void }) => {
  return (
    <Input
      type="number"
      className="w-full"
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value ? Number(e.target.value) : null)}
    />
  )
}

// 布尔输入组件
const BooleanInput = ({ value, onChange }: { value?: boolean; onChange?: (value: boolean) => void }) => {
  return (
    <RadioGroup
      value={value?.toString()}
      onValueChange={(v) => onChange?.(v === 'true')}
      className="flex gap-4"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="true" id="true" />
        <label htmlFor="true" className="text-sm cursor-pointer">{'真'}</label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="false" id="false" />
        <label htmlFor="false" className="text-sm cursor-pointer">{'假'}</label>
      </div>
    </RadioGroup>
  )
}

// 枚举输入组件
const EnumInput = ({ value, onChange, schema, mode }: EnumInputProps) => {
  const [open, setOpen] = useState(false)
  const currentValue = isArray(value) ? value : (typeof value === 'object' && value !== null ? (value.$in || value.in) : value)

  const enum_title = schema?.enum_title || schema?.enum_title1 || schema?.enumNames || []
  const enums = schema?.enum || schema?.enum1 || []

  // 多选模式
  if (mode == 'multiple') {
    const selectedValues = (currentValue as string[]) || []

    // 处理选项选择
    const handleSelectOption = (item: string) => {
      const isSelected = selectedValues.includes(item)
      const newValues = isSelected
        ? selectedValues.filter((v) => v !== item)
        : [...selectedValues, item]
      onChange?.(newValues)
    }

    // 清除所有选择
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange?.([])
    }

    // 格式化显示值
    const formatDisplayValue = () => {
      if (selectedValues.length === 0) return '请选择'
      return selectedValues
        .map((v) => enum_title[enums.indexOf(v)] || v)
        .join(', ')
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className="flex items-center justify-between w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground"
          >
            <span className="flex-1 truncate">{formatDisplayValue()}</span>
            <div className="flex items-center gap-1">
              {selectedValues.length > 0 && (
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" onClick={handleClear} />
              )}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full min-w-[200px]" align="start">
          <div className="p-2 max-h-60 overflow-y-auto">
            {enums?.map((item, index) => {
              const isSelected = selectedValues.includes(item)
              return (
                <div
                  key={item}
                  className="flex items-center px-3 py-2 text-sm cursor-pointer rounded-md hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleSelectOption(item)}
                >
                  <Checkbox checked={isSelected} className="mr-2" />
                  <span>{enum_title[index] || item}</span>
                </div>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // 单选模式
  return (
    <Select
      value={(currentValue as string) || ''}
      onValueChange={(v) => onChange?.(v)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="请选择" />
      </SelectTrigger>
      <SelectContent>
        {enums?.map((item, index) => {
          return (
            <SelectItem key={item} value={item}>
              {enum_title[index] || item}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

// 范围输入组件
const RangeInput = ({ value, onChange }: { value?: RangeInputValue; onChange?: (value: RangeInputValue) => void }) => {
  const handleChange = (val: string, type: 'gte' | 'lte') => {
    onChange?.({ ...value, [type]: val })
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={value?.gte ?? ''}
        onChange={(e) => handleChange(e.target.value, 'gte')}
        placeholder="最小值"
        className="flex-1"
      />
      <span className="text-muted-foreground">~</span>
      <Input
        type="number"
        value={value?.lte ?? ''}
        onChange={(e) => handleChange(e.target.value, 'lte')}
        placeholder="最大值"
        className="flex-1"
      />
    </div>
  )
}

// 变化范围时间输入组件
const VariateRangeTimeInput = ({ value, onChange, schema }: {
  value?: VariateRangeTimeValue
  onChange?: (value: VariateRangeTimeValue, expression?: string | null) => void
  schema?: FilterFieldSchema
}) => {
  const fmt = schema?.format || schema?.formatType
  const timeFormat = schema?.timeFormat || (fmt == 'time' ? 'HH:mm:ss' : fmt == 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss')
  const [type, setType] = useState<string | undefined>(value?.type)
  const opts = [
    { key: '前', value: 'forward' },
    { key: '后', value: 'backward' },
    { key: '当前', value: 'now' }
  ]
  const list = [
    { key: '年', value: 'Y' },
    { key: '季度', value: 'Q' },
    { key: '月', value: 'M' },
    { key: '周', value: 'w' },
    { key: '天', value: 'd' },
    { key: '时', value: 'h' },
    { key: '分', value: 'm' },
    { key: '秒', value: 's' }
  ]
  const unitList = list.filter(item => {
    const arr = timeFormat == 'YYYY-MM-DD'
      ? ['Y', 'Q', 'M', 'w', 'd']
      : timeFormat == 'HH:mm:ss'
        ? ['h', 'm', 's']
        : timeFormat == 'HH:mm'
          ? ['h', 'm']
          : list.map(v => v.value)
    return arr.indexOf(item.value) > -1
  })

  const handleChange = (v: Partial<VariateRangeTimeValue>) => {
    const timeRange = { ...value, ...v }
    const start = timeRange.fromNow ? 'now' : 'nowzero'
    const mid = timeRange.type == 'forward' ? ' - ' : timeRange.type == 'backward' ? ' + ' : ''
    const end = timeRange.unit && !isNil(timeRange.count) ? timeRange.count + timeRange.unit : ''
    const newTime = timeRange.unit
      ? (timeRange.type == 'now' ? 'now ' + timeRange.unit : (end && mid ? start + mid + end : null))
      : null
    onChange?.(timeRange, newTime)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select
          value={value?.type || ''}
          onValueChange={(v) => { setType(v); handleChange({ type: v }) }}
        >
          <SelectTrigger className="w-[30%]">
            <SelectValue placeholder="选择方向" />
          </SelectTrigger>
          <SelectContent>
            {opts.map(item => (
              <SelectItem key={item.value} value={item.value}>{item.key}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {type != 'now' && (
          <Input
            type="number"
            value={value?.count ?? ''}
            onChange={(e) => handleChange({ count: e.target.value ? Number(e.target.value) : null })}
            placeholder={"输入数值"}
            min={1}
            className="flex-1"
          />
        )}
        <Select
          value={value?.unit || ''}
          onValueChange={(v) => handleChange({ unit: v })}
        >
          <SelectTrigger className="w-[30%]">
            <SelectValue placeholder="单位" />
          </SelectTrigger>
          <SelectContent>
            {unitList.map(item => (
              <SelectItem key={item.value} value={item.value}>{item.key}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {type != 'now' && (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={value?.fromNow || false}
            onCheckedChange={(checked) => handleChange({ fromNow: checked === true })}
          />
          <label className="text-sm">{'从当前开始'}</label>
        </div>
      )}
    </div>
  )
}

// 时间输入组件
const TimeInput = ({ value, onChange, schema }: {
  value?: string
  onChange?: (value: string | null) => void
  schema?: FilterFieldSchema
}) => {
  const fmt = schema?.format || schema?.formatType
  const timeFormat = schema?.timeFormat || (fmt == 'time' ? 'HH:mm:ss' : fmt == 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss')

  const handleChange = (val: Date | undefined) => {
    onChange?.(val ? format(val, timeFormat.replace('YYYY', 'yyyy').replace('DD', 'dd')) : null)
  }

  if (fmt == 'time' || schema?.timeFormat) {
    const _value = value ? new Date(`${dayjs().format('YYYY-MM-DD')} ${value}`) : new Date()
    return (
      <TimePicker
        value={_value}
        onChange={handleChange}
      />
    )
  }

  // 日期/日期时间选择（使用 Popover + Calendar + TimePicker）
  const [open, setOpen] = useState(false)
  const [tempDate, setTempDate] = useState<Date | undefined>(value ? new Date(value) : undefined)

  // Parse date string to Date object
  const parseDate = (dateStr: string | undefined) => {
    if (!dateStr) return undefined
    const parsed = dayjs(dateStr)
    return parsed.isValid() ? parsed.toDate() : undefined
  }

  const currentDate = parseDate(value)

  // Format display value
  const formatDisplayValue = (date: Date | undefined) => {
    return date ? dayjs(date).format(timeFormat == 'HH:mm:ss' ? 'HH:mm:ss' : 'YYYY-MM-DD HH:mm:ss') : ''
  }

  // Date selection handlers
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setTempDate(prev => {
        if (!prev) return new Date(selectedDate)
        const newDate = new Date(prev)
        newDate.setFullYear(selectedDate.getFullYear())
        newDate.setMonth(selectedDate.getMonth())
        newDate.setDate(selectedDate.getDate())
        return newDate
      })
    }
  }

  const handleTimeChange = (newDate: Date) => {
    setTempDate(newDate)
  }

  const handleConfirm = () => {
    if (tempDate) {
      const formatted = format(tempDate, timeFormat.replace('YYYY', 'yyyy').replace('DD', 'dd'))
      onChange?.(formatted)
    }
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(null)
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempDate(currentDate || new Date())
    }
    setOpen(open)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className="w-full">
          <InputGroup className="h-9">
            <InputGroupInput
              value={formatDisplayValue(currentDate)}
              placeholder={fmt == 'date' ? '选择日期' : '选择日期时间'}
              readOnly
              className="cursor-pointer"
            />
            <InputGroupAddon align="inline-end">
              {currentDate && (
                <InputGroupButton
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleClear}
                >
                  <X className="h-3 w-3" />
                </InputGroupButton>
              )}
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden p-0"
        align="end"
        alignOffset={-8}
        sideOffset={10}
      >
        <div className="flex">
          <Calendar
            mode="single"
            selected={tempDate}
            onSelect={handleDateSelect}
          />
          {fmt !== 'date' && (
            <div className="w-full border-t pt-4">
              <TimePicker
                value={tempDate || new Date()}
                onChange={handleTimeChange}
                inline={true}
              />
            </div>
          )}
        </div>
        <div className="flex justify-end pb-2 px-2">
          <Button size="sm" onClick={handleConfirm}>
            确定
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const RangeTime = (props: {
  value?: any
  onChange?: (value: any | null) => void
  schema?: FilterFieldSchema
}) => {
  const { value, onChange, schema } = props
    
  if (schema?.timeFormat) {
    const startValue = value?.gte    
    const endValue = value?.lte

    const onTimeChange = (val: string | null, type: 'gte' | 'lte') => {
      const newValue = { ...value, [type]: val }
      onChange?.(newValue)
    }

    return <div className="flex items-center gap-2">
      <TimeInput schema={schema} value={startValue} onChange={(val) => onTimeChange(val, 'gte')} />
      <span className="text-muted-foreground">到</span>
      <TimeInput schema={schema} value={endValue} onChange={(val) => onTimeChange(val, 'lte')} />
    </div>
  }
  if (schema?.format == 'date') {
    return <FilterDate {...props} />
  }
  return <FilterDatetime {...props} />
}

// 导出方法和组件
const METHODS: Record<string, MethodItem[]> = {
  'string': [
    { name: '等于', key: 'eq', component: TextInput },
    { name: '不等于', key: 'ne', component: TextInput },
    { name: '包含其中一个', key: 'arrayIn', component: TextInput },
    { name: '同时包含', key: 'arrayInAll', component: TextInput },
    { name: '不包含任何一个', key: 'arrayNin', component: TextInput },
    { name: '开始是', key: 'startsWith', component: TextInput },
    { name: '结尾是', key: 'endsWith', component: TextInput },
    { name: '开始不是', key: 'notStartsWith', component: TextInput },
    { name: '结尾不是', key: 'notEndsWith', component: TextInput },
    { name: '为空', key: 'isNull', component: NullInput },
    { name: '不为空', key: 'notNull', component: NullInput },
  ],
  'number': [
    { name: '等于', key: 'eq', component: NumberInput },
    { name: '不等于', key: 'ne', component: NumberInput },
    { name: '大于', key: 'gt', component: NumberInput },
    { name: '小于', key: 'lt', component: NumberInput },
    { name: '大于等于', key: 'gte', component: NumberInput },
    { name: '小于等于', key: 'lte', component: NumberInput },
    { name: '在范围内', key: 'range', component: RangeInput },
    { name: '不在范围内', key: 'notRange', component: RangeInput },
    { name: '为空', key: 'isNull', component: NullInput },
    { name: '不为空', key: 'notNull', component: NullInput },
  ],
  'boolean': [
    { name: '等于', key: 'eq', component: BooleanInput },
    { name: '为空', key: 'isNull', component: NullInput },
    { name: '不为空', key: 'notNull', component: NullInput },
  ],
  'date': [
    { name: '等于', key: 'eq', component: TimeInput },
    { name: '早于', key: 'lt', component: TimeInput },
    { name: '晚于', key: 'gt', component: TimeInput },
    { name: '早于等于', key: 'lte', component: TimeInput },
    { name: '晚于等于', key: 'gte', component: TimeInput },
    { name: '在范围内', key: 'range', component: RangeTime },
    { name: '不在范围内', key: 'notRange', component: RangeTime },
    { name: '为空', key: 'isNull', component: NullInput },
    { name: '不为空', key: 'notNull', component: NullInput },
  ],
  'area': [
    { name: '等于', key: 'eq' },
    { name: '不等于', key: 'ne' },
    { name: '包含其中一个', key: 'in' },
    { name: '不包含任何一个', key: 'nin' },
    { name: '属于', key: 'belongsTo' },
    { name: '不属于', key: 'notBelongsTo' },
    { name: '下级包含', key: 'subin' },
    { name: '下级不包含', key: 'subNotIn' },
    { name: '为空', key: 'isNull' },
    { name: '不为空', key: 'notNull' },
  ],
  'enum': [
    { name: '等于', key: 'eq', component: EnumInput },
    { name: '不等于', key: 'ne', component: EnumInput },
    { name: '包含其中一个', key: 'in', type: 'multipleSelect', component: (props: EnumInputProps) => <EnumInput {...props} mode='multiple' /> },
    { name: '不包含任何一个', key: 'nin', type: 'multipleSelect', component: (props: EnumInputProps) => <EnumInput {...props} mode='multiple' /> },
    { name: '为空', key: 'isNull', component: NullInput },
    { name: '不为空', key: 'notNull', component: NullInput },
  ],
  'enums': [
    { name: '包含其中一个', key: 'arrayIn', component: EnumInput },
    { name: '同时包含', key: 'arrayInAll', component: EnumInput },
    { name: '不包含任何一个', key: 'arrayNin', component: EnumInput },
    { name: '为空', key: 'isNull', component: NullInput },
    { name: '不为空', key: 'notNull', component: NullInput },
  ],
  'relateArray': [
    { name: '包含', key: 'arrayIn', type: 'multipleSelect' },
    { name: '不包含', key: 'arrayNin', type: 'multipleSelect' },
    { name: '为空', key: 'isNull', component: NullInput },
    { name: '不为空', key: 'notNull', component: NullInput },
  ],
  'relate': [
    { name: '包含其中一个', key: 'in' },
    { name: '不包含任何一个', key: 'nin' },
    { name: '为空', key: 'isNull', component: NullInput },
    { name: '不为空', key: 'notNull', component: NullInput },
  ],
  'relateTo': [
    { name: '等于', key: 'eq' },
    { name: '不等于', key: 'ne' },
    { name: '包含其中一个', key: 'in', type: 'multipleSelect' },
    { name: '不包含任何一个', key: 'nin', type: 'multipleSelect' },
    { name: '为空', key: 'isNull', component: NullInput },
    { name: '不为空', key: 'notNull', component: NullInput },
  ],
  'other': [
    { name: '为空', key: 'isNull', component: NullInput },
    { name: '不为空', key: 'notNull', component: NullInput },
  ]
}

const getMethods = (schema: FilterSchema, fieldKey: string): MethodItem[] => {
  const f = fieldKey.replace('.', '.properties.')
  const fieldSchema = (omit(get(schema.properties, f) as object, 'filterByRes') || {}) as PropItem
  const properties: PropItem[] = convertProps(schema.properties)
  const ops = properties.filter((item) => item.key != 'model' && item.key != 'dashboard')
  const field = schema.formSchema?.find((f) => f.key == fieldKey)
  const _prop = find(ops, (v) => (v.key || v.id) == fieldKey) as PropItem | undefined
  const prop: PropItem = { ...(_prop || {}), ...(field || {}) }
  let methods: MethodItem[]
  if (prop) {
    if ((prop.enum || prop.enum1) && prop.type == 'string') { // 区域 和单选选择器
      methods = METHODS['enum']
    } else if (prop.type == 'array' && (fieldSchema.controlType || fieldSchema.component || fieldSchema.field?.component || fieldSchema.relateTo || fieldSchema.relate)) {
      methods = METHODS['relateArray']
    } else if (prop.selectType == 'multiple' || ['upload', 'upload-group', 'map', 'parentnode'].indexOf(fieldSchema.controlType || '') > -1) { // 定位、附件、附件组等特殊类型
      methods = METHODS['other']
    } else if ((prop.type == 'object' && fieldSchema.controlType) || fieldSchema.relateTo) {
      methods = METHODS['relateTo']
    } else if (prop.type == 'object' && (fieldSchema.controlType || fieldSchema.component || fieldSchema.relateTo || fieldSchema.relate)) {
      methods = METHODS['relateTo']
    } else if (fieldSchema.controlType === 'area') { // 区域 和单选选择器
      methods = METHODS['area']
    } else if (fieldSchema.controlType === 'rich-text') { // 富文本
      methods = METHODS['string'].filter((m) => ['contains', 'notContains', 'isNull', 'notNull'].indexOf(m.key) > -1)
    } else {
      const format = ['date', 'datetime', 'date-time', 'time']
      if (format.includes(prop.format || '') || prop.timeFormat || prop.controlType == 'date' || prop.controlType == 'time') {
        methods = METHODS['date']
      } else {
        methods = METHODS[prop.type as string] || METHODS['other']
      }
    }
    if (prop.related == 'department') {
      methods = methods?.filter((m) => m.key !== 'isNull' && m.key !== 'notNull')
    }
    if (fieldSchema.filterMethodFn) {
      const filterMethods = fieldSchema.filterMethodFn(methods)
      return filterMethods.map((m) => !methods.some((m1) => m1.key == m.key) && m.component ? { ...m, useCustomCom: true } : m)
    }
    return methods
  } else {
    return []
  }
}

export {
  METHODS,
  NullInput,
  TextInput,
  VariateRangeTimeInput,
  getMethods
}

export type { MethodItem }
