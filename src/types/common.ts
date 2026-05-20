// 公共类型定义

export type StatusVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

export interface PaginationParams {
  current: number
  pageSize: number
}

export interface PaginationResponse<T> {
  items: T[]
  total: number
  current: number
  pageSize: number
}
