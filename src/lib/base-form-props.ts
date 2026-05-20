import type { Ref } from 'react'

/** 所有通过 FormField 使用的组件共享的 props */
export interface BaseFormFieldProps {
  /** 当前值（react-hook-form） */
  value?: any
  /** 值变更回调（react-hook-form） */
  onChange?: (value: any) => void
  /** 失焦回调（react-hook-form） */
  onBlur?: () => void
  /** 字段名（react-hook-form） */
  name?: string
  /** ref（react-hook-form） */
  ref?: Ref<any>
  /** 字段 ID（FormField 生成） */
  id?: string
  /** 表单 schema */
  schema?: Record<string, any>
  /** 表单记录数据 */
  record?: any
}

/** 选项类型 */
export interface FormOption {
  value: string | number
  label?: string
  disabled?: boolean
}
