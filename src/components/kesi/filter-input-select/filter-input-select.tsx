import React, { useState, useEffect } from 'react'
import isString from 'lodash/isString'
import omit from 'lodash/omit'
import { useModel, createAPI } from '@airiot/client'
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface FilterInputSelectProps {
  key?: string
  name?: string
  schema?: any
  value?: any
  onChange?: (value: any) => void
}

const FilterInputSelect: React.FC<FilterInputSelectProps> = ({ name, value, onChange }) => {
  const { model } = useModel()
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  // 获取当前选中的值
  const getValue = () => {
    if (!value) return undefined
    // 支持多种查询格式
    if (isString(value)) return value
    if (value.$eq) return value.$eq
    if (value.$in) return value.$in[0]
    return undefined
  }

  const currentValue = getValue()

  // 获取选中值的标签
  const getCurrentLabel = () => {
    if (!currentValue) return ''
    const option = options.find(o => o.value === currentValue)
    return option?.label || currentValue
  }

  const currentLabel = getCurrentLabel()

  // 加载选项数据
  useEffect(() => {
    if (!model || !name) return

    setLoading(true)

    // 构建查询参数
    const groupBy = { [name]: `$${name}` }
    // 移除当前字段的过滤，避免影响选项加载
    const filter = name ? omit({}, [name]) : {}
    const query = { groupBy, filter, withCount: true }

    const api = createAPI({
      resource: `core/t/${model.name}/d`,
      name: 'filter-input-select'
    })

    api.query(query, {})
      .then(({ items = [] }) => {
        const newOptions = items
          .filter((op: any) => !!op[name])
          .map((op: any) => ({
            value: String(op[name]),
            label: String(op[name])
          }))
        setOptions(newOptions)
      })
      .catch(err => {
        setOptions([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [model, name])

  // 过滤选项
  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options
    return options.filter(option =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [options, searchValue])

  // 处理选择
  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue || null)
    setOpen(false)
  }

  // 清空选择
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(null)
  }

  return (
    <div className="relative w-full">
      <Select
        open={open}
        onOpenChange={setOpen}
        value={currentValue}
        disabled={loading}
      >
        <SelectTrigger className="w-full pr-8">
          {currentLabel ? (
            <span className="truncate">{currentLabel}</span>
          ) : (
            <SelectValue placeholder="请选择" />
          )}
        </SelectTrigger>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center">
          {currentValue && (
            <button
              type="button"
              onClick={handleClear}
              className="h-4 w-4 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
        <SelectContent className="max-h-60">
          <div className="p-2">
            <input
              type="text"
              placeholder="搜索..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "w-full h-9 px-3 rounded-md border border-input bg-background text-sm",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "placeholder:text-muted-foreground"
              )}
            />
          </div>
          {loading ? (
            <div className="py-2 px-3 text-sm text-muted-foreground">加载中...</div>
          ) : filteredOptions.length === 0 ? (
            <div className="py-2 px-3 text-sm text-muted-foreground">
              {searchValue ? '无匹配结果' : '暂无选项'}
            </div>
          ) : (
            filteredOptions.map(option => (
              <div
                key={option.value}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  currentValue === option.value && "bg-accent"
                )}
                onClick={() => handleSelect(option.value)}
              >
                <span className="flex-1">{option.label}</span>
                {currentValue === option.value && (
                  <span className="ml-2 text-primary">✓</span>
                )}
              </div>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}

FilterInputSelect.displayName = "FilterInputSelect"

export { FilterInputSelect }
