// 通用 API Hooks
import { useState, useEffect, useCallback } from 'react'

// 通用分页Hook
export function useApiQuery<T>(
  queryFn: (params: any) => Promise<{ list: T[]; total: number }>,
  initialParams: any = {}
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20,
    total: 0,
  })

  const loadData = useCallback(async (params: any = {}) => {
    setLoading(true)
    setError(null)

    try {
      const mergedParams = { ...pagination, ...params }
      const result = await queryFn(mergedParams)

      setData(result.list)
      setPagination({
        page: mergedParams.page,
        size: mergedParams.size,
        total: result.total,
      })
    } catch (err: any) {
      setError(err)
      // Silently handle API query errors
    } finally {
      setLoading(false)
    }
  }, [queryFn, pagination])

  useEffect(() => {
    loadData(initialParams)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refresh = useCallback(() => {
    loadData()
  }, [loadData])

  const changePage = useCallback((page: number, size?: number) => {
    loadData({ page, size: size || pagination.size })
  }, [loadData, pagination.size])

  return {
    data,
    loading,
    error,
    pagination,
    loadData,
    refresh,
    changePage,
  }
}

// 通用详情Hook
export function useApiDetail<T>(
  queryFn: (id: string) => Promise<T>,
  id?: string
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) return

    let isMounted = true
    let cancelled = false

    const fetchData = async () => {
      if (!isMounted || cancelled) return

      try {
        if (isMounted) {
          setLoading(true)
          setError(null)
        }

        const result = await queryFn(id)

        if (isMounted && !cancelled) {
          setData(result)
        }
      } catch (err: any) {
        if (isMounted && !cancelled) {
          setError(err)
          // Silently handle detail fetch errors
        }
      } finally {
        if (isMounted && !cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
      cancelled = true
    }
  }, [id, queryFn])

  return { data, loading, error }
}

// 通用创建Hook
export function useApiCreate<T>(
  createFn: (data: Partial<T>) => Promise<T>,
  onSuccess?: (result: T) => void
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const create = useCallback(async (data: Partial<T>) => {
    setLoading(true)
    setError(null)

    try {
      const result = await createFn(data)
      onSuccess?.(result)
      return result
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [createFn, onSuccess])

  return { create, loading, error }
}

// 通用更新Hook
export function useApiUpdate<T>(
  updateFn: (id: string, data: Partial<T>) => Promise<void>,
  onSuccess?: () => void
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const update = useCallback(async (id: string, data: Partial<T>) => {
    setLoading(true)
    setError(null)

    try {
      await updateFn(id, data)
      onSuccess?.()
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [updateFn, onSuccess])

  return { update, loading, error }
}

// 通用删除Hook
export function useApiDelete(
  deleteFn: (id: string) => Promise<void>,
  onSuccess?: () => void
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const remove = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      await deleteFn(id)
      onSuccess?.()
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [deleteFn, onSuccess])

  return { remove, loading, error }
}
