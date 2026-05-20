import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import moment from 'moment'
import type { BaseFormFieldProps } from '@/lib/base-form-props'

export interface FormTimeProps extends Omit<BaseFormFieldProps, 'value' | 'onChange'> {
  /** 当前值 */
  value?: string
  /** 值变化回调 */
  onChange?: (value: string | null) => void
  /** 时间格式 */
  timeFormat?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 默认值 */
  defaultVal?: string
  /** 默认值类型 */
  defaultValType?: 'fixed' | 'logic'
}

const FormTime = React.forwardRef<HTMLInputElement, FormTimeProps>(
  (props, ref) => {
    const {
      value,
      onChange,
      timeFormat = 'HH:mm:ss',
      disabled = false,
      defaultVal,
      defaultValType = 'fixed',
    } = props

    // 默认值生效
    React.useEffect(() => {
      const timer = setTimeout(() => {
        if (!value && defaultVal && defaultValType !== 'logic') {
          onChange?.(defaultVal)
        }
      }, 0)
      return () => clearTimeout(timer)
    }, [])

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (!val) {
        onChange?.(null)
        return
      }

      // 格式化时间为指定的格式
      const [hours = '00', minutes = '00', seconds = '00'] = val.split(':')

      if (timeFormat === 'HH:mm') {
        onChange?.(`${hours}:${minutes}`)
      } else if (timeFormat === 'HH:mm:ss') {
        onChange?.(`${hours}:${minutes}:${seconds}`)
      } else {
        // 其他格式，直接使用输入值
        onChange?.(val)
      }
    }

    // 转换 value 格式以适配 input type="time"
    const getInputValue = () => {
      if (!value) return ''
      try {
        const date = moment(value, timeFormat)
        if (date.isValid()) {
          return date.format('HH:mm')
        }
      } catch (e) {
        // Ignore
      }
      return ''
    }

    return (
      <Input
        ref={ref}
        type="time"
        value={getInputValue()}
        onChange={handleTimeChange}
        disabled={disabled}
        className={cn('w-full')}
      />
    )
  }
)

FormTime.displayName = 'FormTime'

export { FormTime }
