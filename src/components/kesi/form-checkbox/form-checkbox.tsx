import * as React from "react"
import type { BaseFormFieldProps, FormOption } from "@/lib/base-form-props"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

export interface CheckboxOption {
  name?: string
  label?: string
  value: string
  isDefault?: boolean
}

export interface FormCheckboxProps
  extends Omit<BaseFormFieldProps, "value" | "onChange">,
  Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onBlur"> {
  /** 当前值（多选时为数组） */
  value?: string | string[]
  /** 默认值 */
  defaultValue?: string | string[]
  /** 是否禁用 */
  disabled?: boolean
  /** 选项列表 */
  options?: FormOption[]
  /** 是否显示全选 */
  isCheckAll?: boolean
  /** 全选框是否单独一行 */
  checkAllSeparate?: boolean
  /** 值变化回调 */
  onChange?: (value: string | string[]) => void
  /** 单选框标签（当 options 为空时使用） */
  label?: string
}

const FormCheckbox = React.forwardRef<HTMLDivElement, FormCheckboxProps>(
  (
    {
      className,
      value: controlledValue,
      defaultValue,
      disabled = false,
      options = [],
      isCheckAll = false,
      checkAllSeparate = false,
      onChange,
      label,
      ...props
    },
    ref
  ) => {

    const mergedOptions = React.useMemo(() => {
      return options
    }, [options])
  
    const isMulti = mergedOptions.length > 1
    const defaultList = defaultValue && Array.isArray(defaultValue) ? defaultValue : []
    const [internalValue, setInternalValue] = React.useState<string[]>(
      isMulti ? defaultList : []
    )
    const isControlled = controlledValue !== undefined
    const value = isControlled ? controlledValue : internalValue

    // 处理布尔值：当 options 为空时，value 可能是布尔值
    const getCheckedValues = (): string[] => {
      if (Array.isArray(value)) return value
      if (typeof value === 'string' && value) return [value]
      if (typeof value === 'boolean') return value ? ['checked'] : []
      return []
    }

    // 全选状态
    const [checkAll, setCheckAll] = React.useState(false)
    // 半选状态
    const [indeterminate, setIndeterminate] = React.useState(false)

    // 更新全选/半选状态
    React.useEffect(() => {
      if (isMulti) {
        const checked = getCheckedValues()
        setCheckAll(checked.length === mergedOptions.length)
        setIndeterminate(checked.length > 0 && checked.length < mergedOptions.length)
      }
    }, [value, mergedOptions.length, isMulti])

    // 单个 checkbox 变化
    const handleCheckboxChange = React.useCallback(
      (optionValue: string, checked: string | boolean) => {
        const isChecked = checked === true || checked === "on"
        let newValues: string[]

        if (!isMulti) {
          // 单选模式
          newValues = isChecked ? [optionValue] : []
        } else {
          // 多选模式
          newValues = [...getCheckedValues()]
          if (isChecked) {
            if (!newValues.includes(optionValue)) {
              newValues.push(optionValue)
            }
          } else {
            const index = newValues.indexOf(optionValue)
            if (index > -1) {
              newValues.splice(index, 1)
            }
          }
        }

        const resultValue = isMulti ? newValues : (newValues[0] || "")
        if (!isControlled) {
          setInternalValue(newValues)
        }
        // console.log("handleCheckboxChange", { optionValue, checked, newValues, resultValue })
        onChange?.(resultValue)
      },
      [isMulti, value, isControlled, onChange]
    )

    // 全选变化
    const handleCheckAllChange = React.useCallback(
      (checked: string | boolean) => {
        const isChecked = checked === true || checked === "on"
        const newValues = isChecked ? mergedOptions.map((item) => String(item.value)) : []
        if (!isControlled) {
          setInternalValue(newValues)
        }
        onChange?.(newValues)
      },
      [options, isControlled, onChange]
    )

    return (
      <div
        ref={ref}
        className={cn(
          "widget-checkbox",
          !checkAllSeparate ? "flex" : "grid",
          !checkAllSeparate ? "gap-2" : "",
          className
        )}
        {...props}
      >
        {mergedOptions.length === 0 ? (
          // options 为空时，显示单个 checkbox（输出布尔值）
          label ? (
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={!!value}
                disabled={disabled}
                onCheckedChange={(checked) => {
                  onChange?.(checked as any)
                }}
                aria-invalid={props['aria-invalid']}
              />
              <span className="text-sm">{label}</span>
            </label>
          ) : null
        ) : (
          <>
            {isCheckAll && isMulti && (
              <label className="flex items-center gap-2 check-all">
                <Checkbox
                  checked={checkAll}
                  disabled={disabled}
                  onCheckedChange={handleCheckAllChange}
                  className={indeterminate ? "data-[state=checked]:bg-indeterminate-500" : ""}
                />
                <span className="text-sm">全选</span>
              </label>
            )}
            <div
              className={cn(
                "flex flex-col gap-2",
                checkAllSeparate ? "w-full" : "flex-wrap flex-row"
              )}
            >
              {mergedOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={getCheckedValues().includes(String(option.value))}
                    disabled={disabled}
                    onCheckedChange={(checked) => handleCheckboxChange(String(option.value), checked)}
                    aria-invalid={props['aria-invalid']}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }
)
FormCheckbox.displayName = "FormCheckbox"

export { FormCheckbox }
