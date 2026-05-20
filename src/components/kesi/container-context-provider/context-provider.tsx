import { createContext, useContext, ReactNode, useMemo } from 'react'

// Types
export interface Table {
  id: string
  name: string
}

export interface TableData {
  id: string
  name: string
  table: Table
}

export interface ContextProviderContextValue {
  table: Table
  tableData: TableData
  data: Array<any>
}

const ContextProviderContext = createContext<ContextProviderContextValue | undefined>(
  undefined
)

// Props interface
export interface ContextProviderProps {
  children: ReactNode
  table?: Table
  tableData?: TableData
  data?: Array<any>
}

// Provider Component
export function ContextProvider({
  children,
  table = { id: '', name: '' },
  tableData = { id: '', name: '', table: { id: '', name: '' } },
  data = [],
}: ContextProviderProps) {
  // 使用 useMemo 缓存 value 对象，避免不必要的重新渲染
  const value = useMemo<ContextProviderContextValue>(() => ({
    table,
    tableData,
    data,
  }), [table, tableData, data])

  return (
    <ContextProviderContext.Provider value={value}>
      {children}
    </ContextProviderContext.Provider>
  )
}

// Custom hook to use the context
export function useContextProvider(): ContextProviderContextValue {
  const context = useContext(ContextProviderContext)
  if (context === undefined) {
    throw new Error('useContextProvider must be used within a ContextProvider')
  }
  return context
}
