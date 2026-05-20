import React, { useState, useEffect } from 'react'
import isString from 'lodash/isString'
import isEmpty from 'lodash/isEmpty'
import { createAPI, useModel } from '@airiot/client'
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterRelateUniqueProps {
  value?: any
  onChange?: (value: any) => void
  key?: string
  displayField?: string
  schema?: {
    title?: string
    relateTo?: string
    filterByRes?: string
    [key: string]: any
  }
  internalTable?: boolean
  relateSchema?: any
  filter?: any
  disabled?: boolean
}

const FilterRelateUnique: React.FC<FilterRelateUniqueProps> = (props) => {
  const { schema, onChange, value, internalTable, displayField = 'name', disabled, key } = props || {}
  const { model } = useModel()

  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  // 初始化选中的值
  const getSelectedValues = () => {
    if (!value) return []
    if (value.ne) return [] // 排除条件不显示
    if (internalTable) {
      return isString(value) ? [value] : []
    }
    // 多选模式
    if (value.in) return value.in
    if (value.nin) return value.nin
    return []
  }

  const selectedValues = getSelectedValues()

  // 加载选项数据
  useEffect(() => {
    if (disabled || !model) return

    if (!key) return

    setLoading(true)

    const api = createAPI({
      resource: `core/t/${model.name}/d`,
      name: 'filter-relate-unique'
    })

    api.query({ fields: [key] }, {})
      .then(({ items }) => {
        // 过滤掉空值并去重
        const arr = items.filter(v => v[key] && !isEmpty(v[key]))
        const optionList = arr.reduce((prev, cur) => {
          const id = cur[key]?.id
          return prev.map((v: { value: string }) => v.value).includes(id) ? prev : [...prev, cur]
        }, [] as any[])

        const newOptions = optionList.map((op: any) => {
          const relateData = op[key]
          return {
            value: relateData?.id,
            label: internalTable ? relateData?.name : relateData?.[displayField || 'name']
          }
        }).filter((o: any) => o.value && o.label)

        setOptions(newOptions)
      })
      .catch(err => {
        setOptions([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [model, key, disabled])

  // 处理值变化
  const handleChange = (values: string[]) => {
    if (!onChange) return

    if (!values || values.length === 0) {
      onChange(null)
      return
    }

    if (internalTable) {
      // 内部表单选模式
      onChange(values[0] || null)
    } else {
      // 多选模式
      onChange({ in: values })
    }
  }

  // 处理单个选项的点击
  const handleToggle = (optionValue: string) => {
    let newValues: string[]

    if (internalTable) {
      // 单选模式：直接设置为该值
      newValues = [optionValue]
    } else {
      // 多选模式：切换选中状态
      newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v: string) => v !== optionValue)
        : [...selectedValues, optionValue]
    }

    handleChange(newValues)

    // 单选模式下选择后关闭
    if (internalTable) {
      setOpen(false)
    }
  }

  // 清空选择
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(null)
  }

  // 获取选中的标签
  const getSelectedLabels = () => {
    return options
      .filter(o => selectedValues.includes(o.value))
      .map(o => o.label)
  }

  const selectedLabels = getSelectedLabels()

  return (
    <div className="relative w-full">
      <Select
        open={open}
        onOpenChange={setOpen}
        value={internalTable ? selectedValues[0] : undefined}
        disabled={disabled || loading}
      >
        <SelectTrigger
          className={cn(
            "w-full",
            selectedValues.length > 0 && "h-auto min-h-10 py-1"
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedLabels.length > 0 ? (
              selectedLabels.map((label, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {label}
                </Badge>
              ))
            ) : (
              <SelectValue placeholder={`请选择${schema?.title || '关联字段'}`} />
            )}
          </div>
          {selectedLabels.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="ml-2 shrink-0 opacity-50 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {loading ? (
            <div className="py-2 px-3 text-sm text-muted-foreground">加载中...</div>
          ) : options.length === 0 ? (
            <div className="py-2 px-3 text-sm text-muted-foreground">暂无选项</div>
          ) : (
            options.map(option => {
              const isSelected = selectedValues.includes(option.value)
              return (
                <div
                  key={option.value}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    isSelected && "bg-accent"
                  )}
                  onClick={() => handleToggle(option.value)}
                >
                  <span className="flex-1">{option.label}</span>
                  {isSelected && (
                    <span className="ml-2 text-primary">✓</span>
                  )}
                </div>
              )
            })
          )}
        </SelectContent>
      </Select>
    </div>
  )
}

FilterRelateUnique.displayName = "FilterRelateUnique"

export { FilterRelateUnique }
