import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import type { BaseFormFieldProps } from "@/lib/base-form-props"

import { cn } from "@/lib/utils"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea
} from "@/components/ui/input-group"
import { ButtonGroup } from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"

const inputVariants = cva(
  "relative border transition-colors flex items-center",
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

export interface InputProps
  extends Omit<BaseFormFieldProps, 'value' | 'onChange' | 'onBlur'>,
  Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onBlur" | "onFocus" | "onInput" | "prefix">,
  VariantProps<typeof inputVariants> {
  /**
   * 输入框类型
   */
  inputType?: "input" | "textarea"
  /**
   * 内容类型
   */
  textContent?: 'text' | 'password' | 'email' | 'url' | 'tel'
  /**
   * 当前值
   */
  value?: string
  /**
   * 默认值
   */
  defaultValue?: string
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
   * 是否显示清除按钮
   */
  allowClear?: boolean
  /**
   * 是否显示边框
   */
  bordered?: boolean
  /**
   * 最大长度
   */
  maxLength?: number
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
   * 是否展示字数统计
   */
  showCount?: boolean
  /**
   * 是否去除空格
   */
  delBlank?: boolean
  /**
   * 自动聚焦
   */
  autoFocus?: boolean
  /**
   * 值变化回调
   */
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  /**
   * 回车回调
   */
  onPressEnter?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  /**
   * 失焦回调
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  /**
   * 聚焦回调
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  /**
   * 输入回调
   */
  onInput?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

const FormInput = React.forwardRef<HTMLDivElement, InputProps>(
  (
    {
      className,
      inputType = "input",
      textContent = "text",
      value: controlledValue,
      defaultValue = "",
      placeholder = "请输入内容",
      disabled = false,
      readOnly = false,
      allowClear = false,
      bordered = true,
      maxLength,
      prefix,
      suffix,
      addonBefore,
      addonAfter,
      showCount = false,
      delBlank = false,
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
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const isControlled = controlledValue !== undefined
    const value = isControlled ? controlledValue : internalValue

    const handleClear = React.useCallback(() => {
      const newValue = ""
      if (!isControlled) {
        setInternalValue(newValue)
      }
      const mockEvent = {
        target: { value: newValue },
      } as React.ChangeEvent<HTMLInputElement>
      onChange?.(newValue, mockEvent)
    }, [isControlled, onChange])

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = e.target.value ?? e
        if (!isControlled) {
          setInternalValue(newValue)
        }
        onChange?.(newValue, e)
      },
      [isControlled, onChange]
    )

    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (delBlank && e.target.value) {
          const trimmedValue = e.target.value.trim()
          if (!isControlled) {
            setInternalValue(trimmedValue)
          }
          const mockEvent = {
            target: { value: trimmedValue },
          } as React.ChangeEvent<HTMLInputElement>
          onChange?.(trimmedValue, mockEvent)
        }
        onBlur?.(e)
      },
      [delBlank, isControlled, onChange, onBlur]
    )

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          onPressEnter?.(e)
        }
      },
      [onPressEnter]
    )

    const handleInput = React.useCallback(
      (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onInput?.(e as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
      },
      [onInput]
    )

    const length = value?.length ?? 0
    const isMaxLengthReached = maxLength !== undefined && length >= maxLength

    // 多行输入框
    if (inputType === "textarea") {
      return (
        <InputGroup
          ref={ref}
          className={cn(!bordered && "border-0", inputVariants({ variant }), className)}
          {...props}
        >
          <InputGroupTextarea
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={onFocus}
            onInput={handleInput}
            autoFocus={autoFocus}
            aria-invalid={props['aria-invalid']}
          />
          {allowClear && value && (
            <button
              type="button"
              onClick={handleClear}
              className="hover:text-foreground transition-colors p-2"
              disabled={disabled || readOnly}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
            </button>
          )}
          {showCount && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              <span>{length}</span>
              {maxLength && `/${maxLength}`}
            </div>
          )}
        </InputGroup>
      )
    }

    // 单行输入框
    return (
      <ButtonGroup className={className}>
        {addonBefore && <Button variant="outline">{addonBefore}</Button>}
        <InputGroup
          ref={ref}
          className={cn(!bordered && "border-0", inputVariants({ variant }))}
        >
          {prefix && (
            <InputGroupAddon align="inline-start">
              {prefix}
            </InputGroupAddon>
          )}
          <InputGroupInput
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={onFocus}
            onInput={handleInput}
            autoFocus={autoFocus}
            type={textContent}
            className="focus-visible:ring-ring focus-visible:ring-offset-0"
          />
          {allowClear && value && !disabled && !readOnly && (
            <button
              type="button"
              onClick={handleClear}
              className="hover:text-foreground text-muted-foreground transition-colors p-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
            </button>
          )}
          {suffix && (
            <InputGroupAddon align="inline-end">
              {suffix}
            </InputGroupAddon>
          )}
          {isMaxLengthReached && (
            <div className="absolute right-3 text-xs text-destructive">
              <span>{length}/{maxLength}</span>
            </div>
          )}

        </InputGroup>
        {addonAfter && <Button variant="outline">{addonAfter}</Button>}
      </ButtonGroup>
    )
  }
)
FormInput.displayName = "FormInput"

export { FormInput, inputVariants }
