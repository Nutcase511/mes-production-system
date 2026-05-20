// API 响应类型定义

// 通用响应结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 分页请求参数
export interface PageParams {
  page: number
  size: number
  sort?: string
  order?: 'asc' | 'desc'
}

// 分页响应数据
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  size: number
  totalPages: number
}

// 数据表查询请求（AIRIOT Catalog）
export interface CatalogQueryRequest {
  // 表ID
  tableId: string
  // 查询条件
  filter?: {
    and?: FilterCondition[]
    or?: FilterCondition[]
  }
  // 分页
  page?: number
  size?: number
  // 排序
  sort?: {
    field: string
    order: 'asc' | 'desc'
  }[]
  // 返回字段
  fields?: string[]
}

// 过滤条件
export interface FilterCondition {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'ge' | 'le' | 'like' | 'in'
  value: any
}

// 登录请求
export interface LoginRequest {
  username: string
  password: string
  project?: string
  verifyCode?: string
}

// 登录响应
export interface LoginResponse {
  token: string
  user: {
    id: string
    username: string
    name: string
    email?: string
    role?: string
    roles?: string[]
    permissions?: string[]
    isSuper?: boolean
  }
  expiresIn?: number
}

// 当前用户信息
export interface CurrentUser {
  id: string
  username: string
  name: string
  email?: string
  avatar?: string
  role?: string
  roles?: string[]
  permissions?: string[]
  isSuper?: boolean
  createdAt?: string
}
