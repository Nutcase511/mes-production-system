import * as React from "react"
import { cn } from "@/lib/utils"
import { Button as ShadcnButton } from "@/components/ui/button"
import { FormContext } from "@/lib/form-context"

export interface ButtonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof React.HTMLAttributes<HTMLDivElement>> {
  /**
   * 按钮文字
   */
  text?: React.ReactNode
  /**
   * 隐藏边框
   */
  border?: boolean
  /**
   * 禁用状态
   */
  disable?: boolean | string
  /**
   * 表单提交键
   */
  isSubmit?: boolean
  /**
   * 表单重置键
   */
  isReset?: boolean
  /**
   * 加载状态
   */
  loading?: boolean
  /**
   * 按钮变体
   */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  /**
   * 按钮尺寸
   */
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      text = '按钮',
      border = false,
      disable = false,
      isSubmit = false,
      isReset = false,
      loading = false,
      variant = 'default',
      size = 'default',
      onClick,
      ...props
    },
    ref
  ) => {
    const formContext = React.useContext(FormContext)

    // 处理禁用状态
    const disabled = React.useMemo(() => {
      if (typeof disable === 'boolean') {
        return disable
      }
      if (
        disable === '1' ||
        disable === 'true'
      ) {
        return true
      }
      return false
    }, [disable])

    // 处理按钮文字
    const buttonText = React.useMemo(() => {
      return text || '按钮'
    }, [text])

    // 处理点击事件
    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (disabled) return

      // 调用自定义 onClick
      onClick?.(e as any)

      // 表单提交
      if (isSubmit && formContext?.handleSubmit) {
        formContext.handleSubmit()
      }

      // 表单重置
      if (isReset && formContext?.onReset) {
        formContext.onReset()
      }
    }

    // 合并加载状态
    const isLoading = loading || formContext?.loading || false

    // 处理边框样式
    const buttonStyle = border ? {
      border: 'none',
      boxShadow: 'none'
    } : {}

    return (
      <div
        className={cn("button-container", className)}
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}
        {...props}
      >
        <ShadcnButton
          ref={ref}
          variant={border ? 'ghost' : variant}
          size={size}
          disabled={disabled || isLoading}
          onClick={handleClick}
          style={buttonStyle}
          className="w-full"
        >
          {buttonText}
        </ShadcnButton>
      </div>
    )
  }
)

Button.displayName = "Button"

export { Button }
