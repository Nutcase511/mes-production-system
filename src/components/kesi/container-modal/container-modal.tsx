import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/kesi/button/button"
import { ModalWigetContext } from "@/lib/modal-context"

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 弹窗标题
   */
  title?: string
  /**
   * 弹窗描述
   */
  description?: string
  /**
   * 是否打开
   */
  open?: boolean
  /**
   * 打开状态变化回调
   */
  onOpenChange?: (open: boolean) => void
  /**
   * 弹窗宽度
   */
  modalWidth?: number | string
  /**
   * 弹窗高度
   */
  modalHeight?: number | string
  /**
   * 隐藏遮罩
   */
  hiddenMask?: boolean
  /**
   * 关闭时销毁数据
   */
  destroyOnClose?: boolean
  /**
   * 显示触发按钮
   */
  showTrigger?: boolean
  /**
   * 触发按钮文字
   */
  triggerText?: string
  /**
   * 显示保存按钮
   */
  showSubmitButton?: boolean
  /**
   * 显示取消按钮
   */
  showCancelButton?: boolean
  /**
   * 保存按钮文字
   */
  submitText?: string
  /**
   * 取消按钮文字
   */
  cancelText?: string
  /**
   * 保存按钮点击回调
   */
  onSubmit?: () => void | Promise<void>
  /**
   * 取消按钮点击回调
   */
  onCancel?: () => void
  /**
   * 子元素
   */
  children?: React.ReactNode
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      title = '弹窗标题',
      description,
      open,
      onOpenChange,
      modalWidth = 500,
      modalHeight,
      hiddenMask = false,
      destroyOnClose = false,
      showTrigger = false,
      triggerText = '打开弹窗',
      showSubmitButton = false,
      showCancelButton = false,
      submitText = '保存',
      cancelText = '取消',
      onSubmit,
      onCancel,
      children,
      ...props
    },
    ref
  ) => {
    // 内部状态管理（当 open 未受控时使用）
    const [internalOpen, setInternalOpen] = React.useState(false)

    // 表单信息状态（用于与内部表单组件通信）
    const [formInfo, _setFormInfo] = React.useState<{
      handleSubmit?: () => Promise<void>
      submitting?: boolean
      invalid?: boolean
      onReset?: () => void
    }>({})

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

    // 处理保存（支持表单提交）
    const handleSubmit = async () => {
      // 如果有表单提交函数，优先使用表单提交
      if (formInfo?.handleSubmit) {
        await formInfo.handleSubmit()
      }
      // 否则使用自定义 onSubmit
      if (onSubmit) {
        await onSubmit()
      }
      handleOpenChange(false)
    }

    // 处理取消（支持表单重置）
    const handleCancel = () => {
      // 如果有表单重置函数，调用表单重置
      if (formInfo?.onReset) {
        formInfo.onReset()
      }
      // 调用自定义 onCancel
      onCancel?.()
      handleOpenChange(false)
    }

    // 计算样式
    const contentStyle = React.useMemo(() => {
      const style: React.CSSProperties = {}
      if (typeof modalWidth === 'number') {
        style.width = `${modalWidth}px`
      } else if (typeof modalWidth === 'string') {
        style.width = modalWidth
      }

      if (modalHeight) {
        if (typeof modalHeight === 'number') {
          style.maxHeight = `${modalHeight}px`
        } else if (typeof modalHeight === 'string') {
          style.maxHeight = modalHeight
        }
      }

      return style
    }, [modalWidth, modalHeight])

    // Modal Context 值
    const modalContextValue = React.useMemo(() => ({
      open: isOpen,
      setOpen: handleOpenChange,
      showButton: showSubmitButton || showCancelButton,
      formInfo
    }), [isOpen, showSubmitButton, showCancelButton, formInfo])

    return (
      <ModalWigetContext.Provider value={modalContextValue}>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          {showTrigger && (
            <DialogTrigger asChild>
              <Button variant="outline">{triggerText}</Button>
            </DialogTrigger>
          )}
          <DialogContent
            ref={ref}
            className={cn("modal-container", className)}
            style={contentStyle}
            onPointerDownOutside={() => {
              // 阻止点击遮罩关闭（如果需要）
              // event.preventDefault()
            }}
            {...props}
          >
            {(title || description) && (
              <DialogHeader>
                {title && <DialogTitle>{title}</DialogTitle>}
                {description && <DialogDescription>{description}</DialogDescription>}
              </DialogHeader>
            )}

            <div
              className={cn(
                "overflow-auto",
                modalHeight && "flex-1"
              )}
              style={{
                maxHeight: modalHeight ? 'calc(100% - 100px)' : undefined
              }}
            >
              {destroyOnClose && isOpen ? children : !destroyOnClose && children}
            </div>

            {(showSubmitButton || showCancelButton) && (
              <DialogFooter>
                {showCancelButton && (
                  <Button variant="outline" onClick={handleCancel}>
                    {cancelText}
                  </Button>
                )}
                {showSubmitButton && (
                  <Button
                    onClick={handleSubmit}
                    loading={formInfo?.submitting}
                    disabled={formInfo?.invalid}
                  >
                    {submitText}
                  </Button>
                )}
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </ModalWigetContext.Provider>
    )
  }
)

Modal.displayName = "Modal"

export { Modal }
