import { useModelList, useModelSave, useModelGetItems } from '@airiot/client'

export function useModelListWithOptions<T = any>(options?: {
  initQuery?: boolean
  query?: Record<string, any>
  tableId?: string
}) {
  return (useModelList as any)(options) as ReturnType<typeof useModelList<T>>
}

export function useModelSaveWithTable<T extends { id?: string } & Record<string, any> = any>(options?: {
  tableId?: string
}) {
  return (useModelSave as any)(options) as ReturnType<typeof useModelSave<T>>
}

export function useModelGetItemsWithTable<T = any>(options?: {
  tableId?: string
}) {
  return (useModelGetItems as any)(options) as ReturnType<typeof useModelGetItems<T>>
}