import * as React from 'react'
import isArray from 'lodash/isArray'
import { createAPI } from '@airiot/client'
import type { BaseFormFieldProps } from '@/lib/base-form-props'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Loader2, X, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FormUserRoleOption {
  value: string
  label: string
  key: string
  item?: any
}

export interface FormUserRoleProps extends Omit<BaseFormFieldProps, 'value' | 'onChange'> {
  /** 字段名 */
  name?: string
  /** 当前值 */
  value?: any
  /** 值变化回调 */
  onChange?: (value: any) => void
  /** 显示字段 */
  displayField?: string
  /** 展示字段 */
  showField?: string
  /** 是否忽略管理员 */
  ignoreAdmin?: boolean
  /** 字段配置 */
  fieldSchema?: {
    enum?: string[]
    enum_title?: string[]
    enum1?: string[]
    enum_title1?: string[]
  }
  /** 标签 */
  label?: string
  /** 是否禁用 */
  disabled?: boolean
  relateTo?: string
  /** 模式 */
  mode?: 'single' | 'multiple'
}

const FormUserRoleSelect: React.FC<FormUserRoleProps> = (props) => {
  const {
    value,
    onChange,
    relateTo,
    displayField = 'name',
    showField,
    ignoreAdmin = false,
    label,
    disabled,
    mode = 'single'
  } = props

  const [loading, setLoading] = React.useState(false)
  const [options, setOptions] = React.useState<FormUserRoleOption[]>([])
  const [open, setOpen] = React.useState(false)
  const [inputSearchValue, setInputSearchValue] = React.useState('')
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1)

  // 过滤后的选项
  const filteredOptions = React.useMemo(() => {
    if (!inputSearchValue) return options
    const searchLower = inputSearchValue.toLowerCase()
    return options.filter((option) =>
      option.label?.toLowerCase().includes(searchLower)
    )
  }, [inputSearchValue, options])

  // 加载选项
  const loadOptions = React.useCallback(
    async () => {
      setLoading(true)
      try {
        const api = createAPI({
          resource: 'core/' + (relateTo == 'Role' ? 'role' : 'user'),
        })

        const fields = showField ? ['id', displayField, showField] : ['id', displayField]

        const { items } = await api.query({
          limit: 100,
          fields
        }, {})

        const newOptions = items
          .map((item: any) => ({
            value: item.id,
            label: item[displayField],
            key: item.id,
            item,
          }))
          .filter((opt) => !(ignoreAdmin && opt.value === 'admin'))

        setOptions(newOptions)
      } catch (error) {
        setOptions([])
      } finally {
        setLoading(false)
      }
    },
    [relateTo, displayField, showField, ignoreAdmin]
  )

  // 打开下拉时加载选项
  React.useEffect(() => {
    if (open && options.length === 0) {
      loadOptions()
    }
    setHighlightedIndex(-1)
  }, [open, options.length, loadOptions])

  // 搜索时重置高亮
  React.useEffect(() => {
    setHighlightedIndex(-1)
  }, [inputSearchValue])

  // 检查选项是否被选中
  const isSelected = (optionValue: string): boolean => {
    if (mode === 'multiple') {
      return isArray(value) && value.some((v: any) => v?.id === optionValue)
    }
    return value?.id === optionValue
  }

  // 处理选项点击
  const handleSelectOption = (option: FormUserRoleOption) => {
    if (mode === 'multiple') {
      const currentValues = isArray(value) ? value : []
      const optionIsSelected = currentValues.some((v: any) => v?.id === option.value)

      if (optionIsSelected) {
        // 取消选择
        onChange?.(currentValues.filter((v: any) => v?.id !== option.value))
      } else {
        // 添加选择
        onChange?.([...currentValues, option.item || { id: option.value }])
      }
      // 多选模式不关闭下拉框
    } else {
      // 单选模式
      onChange?.(option.item || { id: option.value })
      setOpen(false)
      setInputSearchValue('')
    }
  }

  // 处理清除单个选项
  const handleRemoveItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isArray(value)) {
      onChange?.(value.filter((v: any) => v?.id !== itemId))
    }
  }

  // 处理清除所有
  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(mode === 'multiple' ? [] : {})
    setInputSearchValue('')
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => {
        const next = prev + 1
        return next < filteredOptions.length ? next : prev
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => {
        const next = prev - 1
        return next >= 0 ? next : 0
      })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelectOption(filteredOptions[highlightedIndex])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  // 格式化显示值
  const formatDisplayValue = (val: any): string => {
    if (!val) return ''
    if (typeof val === 'string') return val
    return val?.[displayField] || val?.id || ''
  }

  // 计算是否有值
  const hasValue = mode === 'multiple'
    ? (isArray(value) && value.length > 0)
    : !!value

  return (
    <Popover
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) {
          setInputSearchValue('')
        }
      }}
    >
      <PopoverTrigger asChild>
        <div
          className={cn(
            'flex items-center justify-between w-full min-h-10 px-3 py-2 text-sm bg-background border border-input rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          onClick={() => !disabled && setOpen(!open)}
        >
          <span className={cn('flex-1 truncate', !hasValue && 'text-muted-foreground')}>
            {mode === 'multiple' && isArray(value) && value.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {value.map((v: any, index: number) => (
                  <span
                    key={v?.id || index}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded"
                  >
                    {formatDisplayValue(v)}
                    {!disabled && (
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={(e) => handleRemoveItem(v?.id, e)}
                      />
                    )}
                  </span>
                ))}
              </div>
            ) : (
              formatDisplayValue(value) || `选择${label || '用户'}...`
            )}
          </span>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {hasValue && !disabled && (
              <X
                className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={handleClearAll}
              />
            )}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-full min-w-50"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-2">
          {/* 搜索输入框 */}
          <input
            type="text"
            value={inputSearchValue}
            onChange={(e) => setInputSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索..."
            className={cn(
              'w-full h-9 px-3 py-1 text-sm bg-background border border-input rounded-md',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'placeholder:text-muted-foreground'
            )}
          />

          {/* 选项列表 */}
          <div className="mt-1 max-h-60 overflow-y-scroll" onWheel={(e) => e.stopPropagation()}>
            {loading && options.length === 0 ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm">加载中...</span>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {inputSearchValue ? '未找到匹配项' : '暂无数据'}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionIsSelected = isSelected(option.value)
                return (
                  <div
                    key={option.value}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm cursor-pointer rounded-md',
                      'hover:bg-accent hover:text-accent-foreground',
                      highlightedIndex === index && 'bg-accent',
                      optionIsSelected && 'bg-accent text-accent-foreground'
                    )}
                    onClick={() => handleSelectOption(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {mode === 'multiple' && (
                      <div className="mr-2">
                        {optionIsSelected ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <div className="h-4 w-4 border border-foreground/20" />
                        )}
                      </div>
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const FormUserRole: React.FC<FormUserRoleProps> = (props) => {
  const { value, onChange, mode = 'single', disabled, label, name, displayField, showField, ignoreAdmin } = props

  return <FormUserRoleSelect
    value={value}
    onChange={onChange}
    mode={mode}
    disabled={disabled}
    label={label}
    name={name}
    displayField={displayField}
    showField={showField}
    ignoreAdmin={ignoreAdmin}
  />
}

export { FormUserRole }
