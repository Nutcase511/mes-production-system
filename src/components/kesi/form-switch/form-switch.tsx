import * as React from "react"
import type { BaseFormFieldProps } from "@/lib/base-form-props"

import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

export interface FormSwitchProps
  extends Omit<BaseFormFieldProps, 'value' | 'onChange' | 'onBlur' | 'name' | 'ref' | 'id' | 'schema' | 'record'>,
  Omit<React.ComponentPropsWithoutRef<typeof Switch>, "onChange"> {
  /**
   * 当前值
   */
  checked?: boolean
  /**
   * 默认值
   */
  defaultChecked?: boolean
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 自动聚焦
   */
  autoFocus?: boolean
  /**
   * 值变化回调
   */
  onChange?: (checked: boolean) => void
}

const FormSwitch = React.forwardRef<HTMLButtonElement, FormSwitchProps>(
  (
    {
      className,
      checked: controlledChecked,
      defaultChecked = false,
      disabled = false,
      autoFocus = false,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
    const isControlled = controlledChecked !== undefined
    const checked = isControlled ? controlledChecked : internalChecked

    const handleChange = React.useCallback(
      (newChecked: boolean) => {
        if (!isControlled) {
          setInternalChecked(newChecked)
        }
        onChange?.(newChecked)
      },
      [isControlled, onChange]
    )

    return (
      <div className="widget-switch">
        <Switch
          ref={ref}
          className={cn(
            className
          )}
          checked={checked}
          onCheckedChange={handleChange}
          disabled={disabled}
          autoFocus={autoFocus}
          {...props}
          type="button"
        />
      </div>
    )
  }
)
FormSwitch.displayName = "FormSwitch"

export { FormSwitch }
