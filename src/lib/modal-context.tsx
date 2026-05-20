import * as React from "react"

export interface ModalContextValue {
  // 打开状态
  open?: boolean
  // 设置打开状态
  setOpen?: (open: boolean) => void
  // 显示底部按钮
  showButton?: boolean
  // 设置底部按钮
  setShowButton?: (show: boolean) => void
  // 表单信息
  formInfo?: {
    handleSubmit?: () => Promise<void>
    submitting?: boolean
    invalid?: boolean
    onReset?: () => void
  }
  // 设置表单信息
  setFormInfo?: (info: ModalContextValue['formInfo']) => void
}

export const ModalWigetContext = React.createContext<ModalContextValue>({
  open: false,
  setOpen: () => {},
  showButton: false,
  setShowButton: () => {},
  formInfo: undefined,
  setFormInfo: () => {}
})
