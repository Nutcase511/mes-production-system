import * as React from 'react'
import { Input } from '@/components/ui/input'
import type { BaseFormFieldProps } from '@/lib/base-form-props'

export interface FormBytesArrayProps extends Omit<BaseFormFieldProps, 'value' | 'onChange'> {
  /** 当前值 */
  value?: string
  /** 值变化回调 */
  onChange?: (value: string) => void
  /** 占位文本 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
}

const FormBytesArray: React.FC<FormBytesArrayProps> = (props) => {
  const { value, onChange, placeholder, disabled } = props

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value)
  }

  return (
    <Input
      value={value || ''}
      onChange={handleChange}
      placeholder={placeholder || '请输入内容'}
      disabled={disabled}
    />
  )
}

export { FormBytesArray }
