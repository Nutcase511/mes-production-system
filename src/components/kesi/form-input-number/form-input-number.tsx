import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import type { BaseFormFieldProps } from "@/lib/base-form-props"

import { cn } from "@/lib/utils"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ButtonGroup } from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"

const inputNumberVariants = cva(
  "relative border transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-background",
        outline: "border-2 border-primary",
        filled: "border-primary/20 bg-primary/5",
        ghost: "border-transparent hover:bg-accent/50",
      },
      size: {
        sm: "h-8 text-sm",
        md: "h-9 text-base",
        lg: "h-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface InputNumberProps
  extends Omit<BaseFormFieldProps, 'value' | 'onChange' | 'onBlur'>,
  Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onBlur" | "onFocus" | "onInput" | "prefix">,
  VariantProps<typeof inputNumberVariants> {
  /**
   * 当前值
   */
  value?: number
  /**
   * 默认值
   */
  defaultValue?: number
  /**
   * 占位提示
   */
  placeholder?: string
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 是否只读
   */
  readOnly?: boolean
  /**
   * 是否显示边框
   */
  bordered?: boolean
  /**
   * 最大值
   */
  max?: number
  /**
   * 最小值
   */
  min?: number
  /**
   * 小数位数
   */
  decimal?: number | null
  /**
   * 数值精度
   */
  precision?: number
  /**
   * 步长
   */
  step?: number
  /**
   * 单位
   */
  unit?: string
  /**
   * 前缀
   */
  prefix?: React.ReactNode
  /**
   * 后缀
   */
  suffix?: React.ReactNode
  /**
   * 前置标签
   */
  addonBefore?: React.ReactNode
  /**
   * 后置标签
   */
  addonAfter?: React.ReactNode
  /**
   * 自动聚焦
   */
  autoFocus?: boolean
  /**
   * 值变化回调
   */
  onChange?: (value: number | undefined, event: React.ChangeEvent<HTMLInputElement>) => void
  /**
   * 回车回调
   */
  onPressEnter?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  /**
   * 失焦回调
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  /**
   * 聚焦回调
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  /**
   * 输入回调
   */
  onInput?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const FormInputNumber = React.forwardRef<HTMLDivElement, InputNumberProps>(
  (
    {
      className,
      value: controlledValue,
      defaultValue,
      placeholder = "请输入数字",
      disabled = false,
      readOnly = false,
      bordered = true,
      max,
      min,
      decimal,
      precision,
      step = 1,
      unit = '',
      prefix,
      suffix,
      addonBefore,
      addonAfter,
      autoFocus = false,
      onChange,
      onPressEnter,
      onBlur,
      onFocus,
      onInput,
      variant,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue?.toString() || "")
    const [displayValue, setDisplayValue] = React.useState("")
    const [isFocused, setIsFocused] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const isControlled = controlledValue !== undefined
    const numericValue = isControlled ? controlledValue : (internalValue ? parseFloat(internalValue) : undefined)

    // decimal 优先于 precision，兼容 form-number 的配置
    const actualPrecision = decimal !== null && decimal !== undefined ? decimal : precision

    // 格式化显示值
    const formatValue = React.useCallback((val: number | undefined): string => {
      if (val === undefined || val === null || isNaN(val)) return ""
      if (actualPrecision !== undefined && actualPrecision !== null) {
        return val.toFixed(actualPrecision)
      }
      return val.toString()
    }, [actualPrecision])

    // 更新显示值：非聚焦时跟随受控值，聚焦时保持用户输入
    React.useLayoutEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatValue(numericValue))
      }
    }, [numericValue, formatValue, isFocused])

    // 验证和限制数值
    const validateAndClampValue = React.useCallback((val: number): number => {
      let clampedValue = val

      if (min !== undefined && clampedValue < min) {
        clampedValue = min
      }
      if (max !== undefined && clampedValue > max) {
        clampedValue = max
      }

      if (actualPrecision !== undefined && actualPrecision !== null) {
        clampedValue = parseFloat(clampedValue.toFixed(actualPrecision))
      }

      return clampedValue
    }, [min, max, actualPrecision])

    // 处理输入变化
    const handleInputChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value

        // 允许空值、数字、负号、小数点
        if (inputValue === "" || /^-?\d*\.?\d*$/.test(inputValue)) {
          setDisplayValue(inputValue)

          // 如果是有效数字，更新内部值
          const numericVal = inputValue === "" ? undefined : parseFloat(inputValue)
          if (numericVal !== undefined && !isNaN(numericVal)) {

            if (!isControlled) {
              setInternalValue(numericVal.toString())
            }

            onChange?.(numericVal, e)
          } else if (inputValue === "") {
            if (!isControlled) {
              setInternalValue("")
            }
            onChange?.(undefined, e)
          }
        }

        onInput?.(e)
      },
      [isControlled, controlledValue, validateAndClampValue, onChange, onInput]
    )

    // 处理失焦时的最小/最大/精度处理并格式化显示
    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false)
        const val = displayValue?.trim()

        if (val === "") {
          if (!isControlled) {
            setInternalValue("")
          }
          const mockEvent = { target: { value: "" } } as React.ChangeEvent<HTMLInputElement>
          onChange?.(undefined, mockEvent)
        } else {
          const numeric = parseFloat(val as string)
          if (!isNaN(numeric)) {
            const clamped = validateAndClampValue(numeric)
            if (!isControlled) {
              setInternalValue(clamped.toString())
            }
            setDisplayValue(formatValue(clamped))
            const mockEvent = {
              target: { value: clamped.toString() },
            } as React.ChangeEvent<HTMLInputElement>
            onChange?.(clamped, mockEvent)
          } else {
            // 非数字输入，恢复为格式化的当前数值
            setDisplayValue(formatValue(numericValue))
          }
        }

        onBlur?.(e)
      },
      [displayValue, isControlled, validateAndClampValue, formatValue, onChange, onBlur, numericValue]
    )

    // 自动聚焦
    React.useEffect(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current.focus()
      }
    }, [autoFocus])

    // 聚焦时标记状态，让 displayValue 跟随用户输入
    const handleFocus = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true)
        onFocus?.(e)
      },
      [onFocus]
    )

    const inputElement = (
      <InputGroupInput
        ref={inputRef}
        type="number"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        min={min}
        max={max}
        step={step}
        className={cn(!bordered && "border-0")}
      />
    )

    if (addonBefore || addonAfter) {
      return (
        <ButtonGroup>
          {addonBefore && <Button variant="outline">{addonBefore}</Button>}
          <InputGroup
            ref={ref}
            className={cn(
              inputNumberVariants({ variant }),
              !bordered && "border-transparent",
              disabled && "opacity-50 cursor-not-allowed",
              readOnly && "cursor-default",
              className
            )}
          >
            <div className="relative flex flex-1">
              {prefix && (
                <InputGroupAddon align="inline-start">
                  {prefix}
                </InputGroupAddon>
              )}
              {inputElement}
              {(suffix || unit) && (
                <InputGroupAddon align="inline-end">
                  {suffix}
                  {unit && <span className="ml-1 text-sm text-muted-foreground">{unit}</span>}
                </InputGroupAddon>
              )}
            </div>
          </InputGroup>
          {addonAfter && <Button variant="outline">{addonAfter}</Button>}
        </ButtonGroup>
      )
    }

    return (
      <InputGroup
        ref={ref}
        className={cn(
          inputNumberVariants({ variant }),
          !bordered && "border-transparent",
          disabled && "opacity-50 cursor-not-allowed",
          readOnly && "cursor-default",
          className
        )}
        {...props}
      >
        {prefix && (
          <InputGroupAddon align="inline-start">
            {prefix}
          </InputGroupAddon>
        )}
        {inputElement}
        {(suffix || unit) && (
          <InputGroupAddon align="inline-end">
            {suffix}
            {unit && <span className="ml-1 text-sm text-muted-foreground">{unit}</span>}
          </InputGroupAddon>
        )}
      </InputGroup>
    )
  }
)

FormInputNumber.displayName = "FormInputNumber"

export { FormInputNumber }