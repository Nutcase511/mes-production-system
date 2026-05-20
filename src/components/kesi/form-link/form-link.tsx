import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import type { BaseFormFieldProps } from '@/lib/base-form-props'

export interface FormLinkProps extends Omit<BaseFormFieldProps, 'value' | 'onChange'> {
  /** 当前值 */
  value?: string
  /** 值变化回调 */
  onChange?: (value: string) => void
  /** 占位文本 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 链接类型 */
  linkType?: 'in' | 'out'
}

const MenuItemSelect: React.FC<{
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
}> = (props) => {
  const { placeholder } = props
  const [loading] = React.useState(false)

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        菜单项选择器（待迁移）
      </p>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!loading && (
        <p className="text-sm text-muted-foreground">
          {placeholder || '暂无菜单项'}
        </p>
      )}
    </div>
  )
}

const FormLink = React.forwardRef<HTMLDivElement, FormLinkProps>(
  (props, _ref) => {
    const { value, onChange, placeholder, disabled, linkType } = props

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value)
    }

    return linkType === 'in' ? (
      <MenuItemSelect
        value={value}
        onChange={onChange}
        placeholder={placeholder || '选择系统内置的菜单项'}
        disabled={disabled}
      />
    ) : (
      <Input
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder || '请输入链接'}
        disabled={disabled}
      />
    )
  }
)

FormLink.displayName = 'FormLink'

export { FormLink }
