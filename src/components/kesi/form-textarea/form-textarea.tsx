import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import type { BaseFormFieldProps } from "@/lib/base-form-props"

import { cn } from "@/lib/utils"
import {
  InputGroup,
  InputGroupTextarea
} from "@/components/ui/input-group"

const textareaVariants = cva(
  "relative border transition-colors flex items-center",
  {
    variants: {
      variant: {
        default: "border-border bg-background",
        outline: "border-2 border-primary",
        filled: "border-primary/20 bg-primary/5",
        ghost: "border-transparent hover:bg-accent/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface TextareaProps
  extends Omit<BaseFormFieldProps, 'value' | 'onChange' | 'onBlur'>,
  Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onBlur" | "onFocus" | "onInput" | "prefix">,
  VariantProps<typeof textareaVariants> {
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
  onChange?: (value: string, event: React.ChangeEvent<HTMLTextAreaElement>) => void
  /**
   * 失焦回调
   */
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
  /**
   * 聚焦回调
   */
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
  /**
   * 输入回调
   */
  onInput?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
}

const FormTextarea = React.forwardRef<HTMLDivElement, TextareaProps>(
  (
    {
      className,
      defaultValue = "",
      placeholder = "请输入内容",
      disabled = false,
      readOnly = false,
      allowClear = false,
      bordered = true,
      maxLength,
      showCount = false,
      delBlank = false,
      autoFocus = false,
      onChange,
      onBlur,
      onFocus,
      onInput,
      variant,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const isControlled = props.value !== undefined
    const value = isControlled ? props.value : internalValue

    const handleClear = React.useCallback(() => {
      const newValue = ""
      if (!isControlled) {
        setInternalValue(newValue)
      }
      const mockEvent = {
        target: { value: newValue },
      } as React.ChangeEvent<HTMLTextAreaElement>
      onChange?.(newValue, mockEvent)
    }, [isControlled, onChange])

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        if (!isControlled) {
          setInternalValue(newValue)
        }
        onChange?.(newValue, e)
      },
      [isControlled, onChange]
    )

    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        if (delBlank && e.target.value) {
          const trimmedValue = e.target.value.trim()
          if (!isControlled) {
            setInternalValue(trimmedValue)
          }
          const mockEvent = {
            target: { value: trimmedValue },
          } as React.ChangeEvent<HTMLTextAreaElement>
          onChange?.(trimmedValue, mockEvent)
        }
        onBlur?.(e)
      },
      [delBlank, isControlled, onChange, onBlur]
    )

    const handleInput = React.useCallback(
      (e: React.FormEvent<HTMLTextAreaElement>) => {
        onInput?.(e as React.ChangeEvent<HTMLTextAreaElement>)
      },
      [onInput]
    )

    const length = value?.length ?? 0

    return (
      <InputGroup
        ref={ref}
        className={cn(!bordered && "border-0", textareaVariants({ variant }), className)}
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
)
FormTextarea.displayName = "FormTextarea"

export { FormTextarea, textareaVariants }
