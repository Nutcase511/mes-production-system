// 模拟数据 Hook
import { useState, useEffect } from 'react'
import { mockData } from '@/lib/mock-data'

export function useMockData<T>(key: keyof typeof mockData) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟网络延迟
    const timer = setTimeout(() => {
      setData(mockData[key] as T[])
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [key])

  return { data, loading }
}

// 带分页的 Hook
export function useMockDataPagination<T>(key: keyof typeof mockData) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  })

  const loadData = async (params: { current: number; pageSize: number }) => {
    setLoading(true)
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    const allData = mockData[key] as T[]
    const start = (params.current - 1) * params.pageSize
    const end = start + params.pageSize
    const pageData = allData.slice(start, end)

    setData(pageData)
    setPagination({
      current: params.current,
      pageSize: params.pageSize,
      total: allData.length
    })
    setLoading(false)
  }

  useEffect(() => {
    loadData({ current: 1, pageSize: 20 })
  }, [key])

  return {
    data,
    loading,
    pagination,
    loadData,
    refresh: () => loadData({ current: pagination.current, pageSize: pagination.pageSize })
  }
}
