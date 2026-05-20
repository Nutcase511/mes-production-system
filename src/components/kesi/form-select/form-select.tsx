import * as React from "react"
import type { BaseFormFieldProps, FormOption } from "@/lib/base-form-props"

import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X } from "lucide-react"

export interface FormSelectProps
  extends Omit<BaseFormFieldProps, "value" | "onChange">,
  Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onBlur" | "onFocus"> {
  /** 当前值 */
  value?: string
  /** 默认值 */
  defaultValue?: string
  /** 占位符 */
  placeholder?: string
  /** 选项列表 */
  options?: FormOption[]
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** 是否显示边框 */
  bordered?: boolean
  /** 是否显示清除按钮 */
  allowClear?: boolean
  /** 是否支持搜索 */
  showSearch?: boolean
  /** 是否显示下拉箭头 */
  showArrow?: boolean
  /** 是否自动获取焦点 */
  autoFocus?: boolean
  /** 默认是否展开 */
  defaultOpen?: boolean
  /** 下拉菜单和选择器同宽 */
  dropdownMatchSelectWidth?: boolean
  /** 值改变时的回调 */
  onChange?: (value: string) => void
  /** 失去焦点时的回调 */
  onBlur?: () => void
  /** 获得焦点时的回调 */
  onFocus?: () => void
}

const FormSelect = React.forwardRef<HTMLDivElement, FormSelectProps>(
  ({
    className,
    value,
    defaultValue,
    placeholder = "请选择",
    disabled = false,
    readOnly = false,
    bordered = true,
    allowClear = false,
    showSearch = false,
    showArrow = true,
    autoFocus = false,
    defaultOpen = false,
    dropdownMatchSelectWidth = true,
    onChange,
    onBlur,
    onFocus,
    ...props
  }, _ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")
    const [isOpen, setIsOpen] = React.useState(defaultOpen)
    const [searchValue, setSearchValue] = React.useState("")
    const selectRef = React.useRef<HTMLButtonElement>(null)

    // options 由 FormField 从 schema.enum 自动转换，或通过 options prop 显式传入
    let options: FormOption[] = props?.options || []

    const handleValueChange = (newValue: string) => {
      if (readOnly) return
      setInternalValue(newValue)
      setSearchValue("") // 选择后清空搜索
      onChange?.(newValue)
    }

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      if (readOnly) return
      setInternalValue("")
      setSearchValue("")
      setIsOpen(false) // 确保清除后Select关闭
      onChange?.("")
    }

    const handleSearchChange = (value: string) => {
      setSearchValue(value)
    }

    const currentValue = value !== undefined ? value : internalValue
    const showClear = allowClear && currentValue && !disabled && !readOnly

    // 过滤选项
    const filteredOptions = React.useMemo(() => {
      if (!showSearch || !searchValue.trim()) {
        return options
      }
      return options.filter(option => {
        const label = option.label || ''
        return label.toLowerCase().includes(searchValue.toLowerCase()) ||
          String(option.value).toLowerCase().includes(searchValue.toLowerCase())
      })
    }, [options, searchValue, showSearch])

    return (
      <Select
        value={currentValue}
        onValueChange={handleValueChange}
        disabled={disabled || readOnly}
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (open) {
            onFocus?.()
          } else {
            onBlur?.()
          }
        }}
      >
        <div className="relative">
          <SelectTrigger
            ref={selectRef}
            className={cn(
              "w-full",
              !bordered && "border-transparent",
              className
            )}
            size="default"
            aria-invalid={props['aria-invalid']}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          {showClear && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors bg-gray-200 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <SelectContent position="popper">
          {showSearch && (
            <div className="px-3 py-2 border-b">
              <input
                type="text"
                placeholder="搜索选项..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <SelectItem
                key={String(option.value)}
                value={String(option.value)}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))
          ) : (
            showSearch && searchValue && (
              <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                没有找到匹配的选项
              </div>
            )
          )}
        </SelectContent>
      </Select>
    )
  }
)

FormSelect.displayName = "FormSelect"

export { FormSelect }