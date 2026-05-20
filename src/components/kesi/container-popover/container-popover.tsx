import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Popover as ShadcnPopover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Button } from "@/components/kesi/button/button"

export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 按钮文字
   */
  buttonName?: string
  /**
   * 隐藏按钮
   */
  hiddenBtn?: boolean
  /**
   * 禁用状态
   */
  disable?: boolean
  /**
   * 触发方式
   */
  trigger?: 'hover' | 'click'
  /**
   * 位置
   */
  placement?: 'top' | 'bottom' | 'left' | 'right'
  /**
   * 宽度
   */
  width?: number | string
  /**
   * 高度
   */
  height?: number | string
  /**
   * 是否打开
   */
  open?: boolean
  /**
   * 打开状态变化回调
   */
  onOpenChange?: (open: boolean) => void
  /**
   * 子元素
   */
  children?: React.ReactNode
}

const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  (
    {
      className,
      buttonName = '气泡卡片',
      hiddenBtn = false,
      disable = false,
      trigger = 'click',
      placement = 'top',
      width = 200,
      height = 200,
      open,
      onOpenChange,
      children,
      ...props
    },
    ref
  ) => {
    // 内部状态管理（当 open 未受控时使用）
    const [internalOpen, setInternalOpen] = React.useState(false)

    // 判断是否受控
    const isControlled = open !== undefined
    const isOpen = isControlled ? open : internalOpen

    // 处理打开/关闭
    const handleOpenChange = (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    }

    // 计算内容样式
    const contentStyle = React.useMemo(() => {
      const style: React.CSSProperties = {}
      if (typeof width === 'number') {
        style.width = `${width}px`
      } else if (typeof width === 'string') {
        style.width = width
      }

      if (typeof height === 'number') {
        style.height = `${height}px`
      } else if (typeof height === 'string') {
        style.height = height
      }

      return style
    }, [width, height])

    // 渲染触发按钮
    const renderTrigger = () => {
      if (hiddenBtn) {
        return <div style={{ width: '100%', height: '100%' }} />
      }

      // hover 模式：使用 PopoverTrigger + 自定义鼠标事件处理
      if (trigger === 'hover') {
        return (
          <PopoverTrigger asChild>
            <div
              onMouseEnter={() => handleOpenChange(true)}
              onMouseLeave={() => handleOpenChange(false)}
              style={{ width: '100%', height: '100%' }}
            >
              <Button
                variant="outline"
                disabled={disable}
                style={{ width: '100%', height: '100%' }}
                onPointerDown={(e) => e.preventDefault()}
              >
                {buttonName}
              </Button>
            </div>
          </PopoverTrigger>
        )
      }

      // click 模式：使用 PopoverTrigger
      return (
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disable}
            style={{ width: '100%', height: '100%' }}
          >
            {buttonName}
          </Button>
        </PopoverTrigger>
      )
    }

    return (
      <div
        ref={ref}
        className={cn("popover-container", className)}
        style={{ height: '100%' }}
        {...props}
      >
        <ShadcnPopover
          open={isOpen}
          onOpenChange={handleOpenChange}
        >
          {renderTrigger()}

          <PopoverContent
            align={placement === 'left' || placement === 'right' ? 'center' : undefined}
            side={
              placement === 'top' ? 'top' :
              placement === 'bottom' ? 'bottom' :
              placement === 'left' ? 'left' :
              placement === 'right' ? 'right' : undefined
            }
            style={contentStyle}
            onOpenAutoFocus={(e: Event) => {
              // hover 模式下不自动聚焦
              if (trigger === 'hover') {
                e.preventDefault()
              }
            }}
          >
            <div
              className="popover-content"
              style={{
                width: '100%',
                height: '100%',
                overflow: 'auto'
              }}
            >
              {children}
            </div>
          </PopoverContent>
        </ShadcnPopover>
      </div>
    )
  }
)

Popover.displayName = "Popover"

export { Popover }
