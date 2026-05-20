/**
 * useTableData Hook
 * 统一的表数据管理 Hook - 包含所有 CRUD 操作
 * 使用 @airiot/client 的 createAPI 实现
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import { toastApi } from '@/components/ui/toast'
import { createAPI } from '@airiot/client'
import type { TableSchema } from '@/services/production.service'
import { getToken } from '@/lib/auth-token'

export interface UseTableDataOptions {
  /** 初始页码 */
  initialPage?: number
  /** 初始每页大小 */
  initialSize?: number
  /** 是否自动加载数据 */
  autoLoad?: boolean
  /** 搜索字段 */
  searchFields?: string[]
  /** 创建成功回调 */
  onCreateSuccess?: (data: any) => void
  /** 更新成功回调 */
  onUpdateSuccess?: () => void
  /** 删除成功回调 */
  onDeleteSuccess?: () => void
  /** 错误回调 */
  onError?: (error: Error) => void
}

export interface UseTableDataReturn {
  // ========== Schema 相关 ==========
  /** 表 Schema */
  schema: TableSchema | null
  /** Schema 是否加载中 */
  schemaLoading: boolean

  // ========== 列表数据相关 ==========
  /** 列表数据 */
  data: any[]
  /** 是否加载中 */
  loading: boolean
  /** 分页信息 */
  pagination: {
    current: number
    pageSize: number
    total: number
    totalPages: number
  }
  /** 搜索文本 */
  searchText: string
  /** 筛选条件 */
  filters: Record<string, any>

  // ========== 列表操作 ==========
  /** 设置搜索文本 */
  setSearchText: (text: string) => void
  /** 设置筛选条件 */
  setFilters: (filters: Record<string, any>) => void
  /** 设置单个筛选条件 */
  setFilter: (key: string, value: any) => void
  /** 刷新数据 */
  reload: () => Promise<void>
  /** 重置搜索和筛选 */
  reset: () => Promise<void>
  /** 切换页码 */
  changePage: (page: number) => Promise<void>
  /** 切换每页大小 */
  changePageSize: (pageSize: number) => Promise<void>

  // ========== 表单相关 ==========
  /** 表单数据 */
  formData: Record<string, any>
  /** 是否正在提交 */
  submitting: boolean
  /** 设置表单数据 */
  setFormData: (data: Record<string, any>) => void
  /** 更新单个字段 */
  updateField: (key: string, value: any) => void
  /** 重置表单 */
  resetForm: () => void
  /** 初始化表单（用于编辑） */
  initForm: (data: Record<string, any>) => void

  // ========== CRUD 操作 ==========
  /** 创建记录 */
  createRecord: (data: any) => Promise<any>
  /** 更新记录 */
  updateRecord: (id: string, data: any) => Promise<void>
  /** 删除记录 */
  deleteRecord: (id: string) => Promise<void>
  /** 获取记录详情 */
  getRecord: (id: string) => Promise<any>

  // ========== 弹窗控制 ==========
  /** 是否打开新建弹窗 */
  isCreateOpen: boolean
  /** 是否打开编辑弹窗 */
  isEditOpen: boolean
  /** 是否打开查看弹窗 */
  isViewOpen: boolean
  /** 当前编辑的记录 ID */
  editingId: string | undefined
  /** 当前查看的记录 */
  viewingRecord: any

  // ========== 弹窗操作 ==========
  /** 打开新建弹窗 */
  openCreate: () => void
  /** 打开编辑弹窗 */
  openEdit: (record: any) => void
  /** 打开查看弹窗 */
  openView: (record: any) => void
  /** 关闭所有弹窗 */
  closeAllDialogs: () => void
}

/**
 * 统一的表数据管理 Hook
 * @param tableId - 表ID
 * @param options - 配置选项
 */
export function useTableData(
  tableId: string,
  options: UseTableDataOptions = {}
): UseTableDataReturn {
  const {
    initialPage = 1,
    initialSize = 15,
    autoLoad = true,
    searchFields = [],
    onCreateSuccess,
    onUpdateSuccess,
    onDeleteSuccess,
    onError,
  } = options

  // ========== Schema 相关 ==========
  const [schema, setSchema] = useState<TableSchema | null>(null)
  const [schemaLoading, setSchemaLoading] = useState(false)
  const schemaLoadedRef = useRef(false)

  // ========== 列表数据相关 ==========
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: initialPage,
    pageSize: initialSize,
    total: 0,
    totalPages: 0,
  })
  const [searchText, setSearchText] = useState('')
  const [filters, setFilters] = useState<Record<string, any>>({})

  // 使用 ref 存储最新的值，避免 useCallback 依赖过多
  const latestFiltersRef = useRef(filters)
  const latestSearchTextRef = useRef(searchText)
  const latestPaginationRef = useRef(pagination)
  const latestSearchFieldsRef = useRef(searchFields)
  const latestSchemaRef = useRef(schema)

  // 更新 ref
  useEffect(() => {
    latestFiltersRef.current = filters
  }, [filters])

  useEffect(() => {
    latestSearchTextRef.current = searchText
  }, [searchText])

  useEffect(() => {
    latestPaginationRef.current = pagination
  }, [pagination])

  useEffect(() => {
    latestSearchFieldsRef.current = searchFields
  }, [searchFields])

  useEffect(() => {
    latestSchemaRef.current = schema
  }, [schema])

  // ========== 表单相关 ==========
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)

  // ========== 弹窗控制 ==========
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [editingId, setEditingId] = useState<string>()
  const [viewingRecord, setViewingRecord] = useState<any>(null)

  // ========== 创建 API 实例 ==========
  const apiRef = useRef<ReturnType<typeof createAPI> | null>(null)
  
  const getAPI = useCallback(() => {
    if (!apiRef.current) {
      // user 表使用特殊的 API 路径
      const isUserTable = tableId.toLowerCase() === 'user'
      apiRef.current = createAPI({
        resource: isUserTable ? 'core/user' : `core/t/${tableId}/d`,
      })
    }
    return apiRef.current
  }, [tableId])

  // ========== Schema 操作 ==========

  /** 加载表 Schema */
  const loadSchema = useCallback(async () => {
    setSchemaLoading(true)
    try {
      const api = getAPI()
      // 使用 fetch 获取 schema（@airiot/client 的 api 没有直接提供 schema 方法）
      const isDev = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
      const baseURL = isDev ? '' : (import.meta.env.VITE_AIRIOT_API_URL || 'https://demo.airiot.link')

      const token = getToken()
      const projectId = import.meta.env.VITE_AIRIOT_PROJECT_ID || ''

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (token) headers['Authorization'] = token
      if (projectId) headers['x-request-project'] = projectId

      const isUserTable = tableId.toLowerCase() === 'user'
      const url = isUserTable
        ? `${baseURL}/rest/core/user/schema`
        : `${baseURL}/rest/core/t/schema/${encodeURIComponent(tableId)}`

      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`获取Schema失败: ${response.status}`)
      }

      const schemaData = await response.json()
      setSchema(schemaData)
      schemaLoadedRef.current = true
    } catch (error: any) {
      onError?.(error)
    } finally {
      setSchemaLoading(false)
    }
  }, [tableId, getAPI, onError])

  // ========== 数据查询操作 ==========

  /** 加载列表数据 - 使用 @airiot/client 的 query 方法 */
  const loadData = useCallback(async (page?: number) => {
    setLoading(true)
    try {
      const api = getAPI()
      
      // 从 ref 获取最新值
      const currentPagination = latestPaginationRef.current
      const currentPage = page || currentPagination.current
      const currentFilters = latestFiltersRef.current
      const currentSearchText = latestSearchTextRef.current

      // 构建 wheres
      const wheres: any[] = []

      // 添加筛选条件
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          wheres.push({
            field: key,
            operator: 'eq',
            value,
          })
        }
      })

      // 添加搜索条件
      if (currentSearchText && latestSearchFieldsRef.current.length > 0) {
        latestSearchFieldsRef.current.forEach(field => {
          wheres.push({
            field,
            operator: 'like',
            value: currentSearchText,
          })
        })
      }

      // 构建 filter 参数
      const filter: any = {
        skip: (currentPage - 1) * currentPagination.pageSize,
        limit: currentPagination.pageSize,
      }


      // 使用 @airiot/client 的 query 方法
      const { items, total } = await api.query(filter, wheres.length > 0 ? wheres : undefined, true)


      setData(items || [])
      setPagination({
        current: currentPage,
        pageSize: currentPagination.pageSize,
        total,
        totalPages: Math.ceil(total / currentPagination.pageSize),
      })
    } catch (error: any) {
      toastApi.error(error.message || '加载数据失败')
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [tableId, getAPI, onError])

  // ========== CRUD 操作 ==========

  /** 创建记录 - 使用 @airiot/client 的 save 方法 */
  const createRecord = useCallback(async (data: any) => {
    setSubmitting(true)
    try {
      const api = getAPI()
      const result = await api.save(data)

      toastApi.success('创建成功')
      onCreateSuccess?.(result)

      return result
    } catch (error: any) {
      toastApi.error(error.message || '创建失败')
      onError?.(error)
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [tableId, getAPI, onCreateSuccess, onError])

  /** 更新记录 - 使用 @airiot/client 的 save 方法 */
  const updateRecord = useCallback(async (id: string, data: any) => {
    setSubmitting(true)
    try {
      const api = getAPI()
      await api.save({ id, ...data }, true) // partial=true

      toastApi.success('更新成功')
      onUpdateSuccess?.()
    } catch (error: any) {
      toastApi.error(error.message || '更新失败')
      onError?.(error)
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [tableId, getAPI, onUpdateSuccess, onError])

  /** 删除记录 - 使用 @airiot/client 的 delete 方法 */
  const deleteRecord = useCallback(async (id: string) => {
    try {
      const api = getAPI()
      await api.delete(id)

      toastApi.success('删除成功')
      onDeleteSuccess?.()

      // 刷新列表
      await loadData()
    } catch (error: any) {
      toastApi.error(error.message || '删除失败')
      onError?.(error)
      throw error
    }
  }, [tableId, getAPI, onDeleteSuccess, onError, loadData])

  /** 获取记录详情 - 使用 @airiot/client 的 get 方法 */
  const getRecord = useCallback(async (id: string) => {
    try {
      const api = getAPI()
      const result = await api.get(id)
      return result
    } catch (error: any) {
      toastApi.error(error.message || '获取详情失败')
      onError?.(error)
      throw error
    }
  }, [tableId, getAPI, onError])

  // ========== 表单操作 ==========

  /** 更新单个字段 */
  const updateField = useCallback((key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  /** 重置表单 */
  const resetForm = useCallback(() => {
    setFormData({})
  }, [])

  /** 初始化表单（用于编辑） */
  const initForm = useCallback((data: Record<string, any>) => {
    if (!schema?.schema?.properties) {
      setFormData(data)
      return
    }

    // 根据 schema 的字段映射数据
    const newFormData: Record<string, any> = {}
    Object.keys(schema.schema.properties).forEach(key => {
      if (data[key] !== undefined) {
        newFormData[key] = data[key]
      }
    })

    setFormData(newFormData)
  }, [schema])

  // ========== 列表操作 ==========

  /** 设置单个筛选条件 */
  const setFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  /** 刷新数据 */
  const reload = useCallback(async () => {
    await loadData(1)
  }, [loadData])

  /** 重置搜索和筛选 */
  const reset = useCallback(async () => {
    setSearchText('')
    setFilters({})
    await loadData(1)
  }, [loadData])

  /** 切换页码 */
  const changePage = useCallback(async (page: number) => {
    setPagination(prev => ({ ...prev, current: page }))
    await loadData(page)
  }, [loadData])

  /** 切换每页大小 */
  const changePageSize = useCallback(async (pageSize: number) => {
    // 立即更新 ref，确保后续 loadData 使用新值
    latestPaginationRef.current = { ...latestPaginationRef.current, pageSize }
    setPagination(prev => ({
      ...prev,
      pageSize,
      current: 1, // 重置到第一页
    }))
    await loadData(1) // 立即加载第一页
  }, [loadData])

  // ========== 弹窗操作 ==========

  /** 打开新建弹窗 */
  const openCreate = useCallback(() => {
    resetForm()
    setEditingId(undefined)
    setIsCreateOpen(true)
  }, [resetForm])

  /** 打开编辑弹窗 */
  const openEdit = useCallback((record: any) => {
    setEditingId(record.id)
    initForm(record)
    setIsEditOpen(true)
  }, [initForm])

  /** 打开查看弹窗 */
  const openView = useCallback((record: any) => {
    setViewingRecord(record)
    setIsViewOpen(true)
  }, [])

  /** 关闭所有弹窗 */
  const closeAllDialogs = useCallback(() => {
    setIsCreateOpen(false)
    setIsEditOpen(false)
    setIsViewOpen(false)
    setEditingId(undefined)
    setViewingRecord(null)
  }, [])

  // ========== 自动加载 ==========
  useEffect(() => {
    loadSchema()
  }, [tableId]) // 只依赖 tableId，避免重复加载

  // 当 schema 加载完成后，自动加载数据（只执行一次）
  useEffect(() => {
    if (autoLoad && !schemaLoading && schemaLoadedRef.current) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, schemaLoading])

  // 当筛选条件变化时，重新加载数据
  useEffect(() => {
    if (autoLoad && !schemaLoading && schemaLoadedRef.current) {
      loadData(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchText])

  // ========== 返回 ==========
  return {
    // Schema
    schema,
    schemaLoading,

    // 列表数据
    data,
    loading,
    pagination,
    searchText,
    filters,
    setSearchText,
    setFilters,
    setFilter,
    reload,
    reset,
    changePage,
    changePageSize,

    // 表单
    formData,
    submitting,
    setFormData,
    updateField,
    resetForm,
    initForm,

    // CRUD
    createRecord,
    updateRecord,
    deleteRecord,
    getRecord,

    // 弹窗
    isCreateOpen,
    isEditOpen,
    isViewOpen,
    editingId,
    viewingRecord,
    openCreate,
    openEdit,
    openView,
    closeAllDialogs,
  }
}
