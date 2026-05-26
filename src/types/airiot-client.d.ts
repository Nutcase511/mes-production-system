import '@airiot/client'

declare module '@airiot/client' {
  export function useModelList<T = any>(options?: {
    initQuery?: boolean
    query?: Record<string, any>
  }): {
    loading: boolean
    items: T[]
    fields: string[]
    selected: T[]
  }
}