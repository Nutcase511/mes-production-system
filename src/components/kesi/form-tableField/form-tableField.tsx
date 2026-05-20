import * as React from "react"
import { cn } from "@/lib/utils"

export interface FormFormProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 字段类型：string/number/boolean
   */
  type: 'string' | 'number' | 'boolean'
  /**
   * 自定义渲染函数
   */
  render?: (schema: Record<string, any>) => React.ReactNode
  /**
   * 字段配置属性
   */
  schema?: Record<string, any>
  /**
   * 字段值
   */
  value?: any
  /**
   * 变化回调
   */
  onChange?: (value: any) => void
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 字段标签
   */
  label?: string
  /**
   * 错误提示
   */
  error?: string
  /**
   * 是否必填
   */
  required?: boolean
  /**
   * 描述文本
   */
  description?: string
  /**
   * 字段名称
   */
  name?: string
}

const FormForm = React.forwardRef<HTMLDivElement, FormFormProps>(
  (
    {
      type,
      render,
      schema,
      value,
      onChange,
      disabled,
      label,
      error,
      required,
      description,
      name,
      className,
      ...props
    },
    ref
  ) => {
    // 合并 schema 和其他属性
    const fieldSchema = React.useMemo(() => {
      return {
        ...schema,
        value,
        onChange,
        disabled,
        name,
      }
    }, [schema, value, onChange, disabled, name])

    return (
      <div ref={ref} className={cn("form-table-field space-y-2", className)} {...props}>
        {label && (
          <label className={cn(
            "text-sm font-medium leading-none",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          )}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {render ? render(fieldSchema) : (
          <div className="text-sm text-muted-foreground">
            字段类型: {type}
          </div>
        )}

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

FormForm.displayName = "FormForm"

export { FormForm }
