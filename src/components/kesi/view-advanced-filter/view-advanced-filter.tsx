import React from 'react'
import { Button } from '@/components/ui/button'
import { QueryEditor } from '@/components/kesi/query-editor/query-editor'
import { useModel, useModelGetItems, useSetModelState } from '@airiot/client'
import cloneDeep from 'lodash/cloneDeep'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getQueryFilter } from '@/lib/filter-utils'

export type FilterFieldType = 'text' | 'number' | 'select' | 'date' | 'date-range'

export interface FilterField {
  name: string
  label: string
  type: FilterFieldType
  options?: { value: string; label: string }[]
  placeholder?: string
}

export interface FilterRule {
  id: string
  field: string
  operator: string
  value: any
  operator2?: string
  value2?: any
}

export type LogicOperator = 'AND' | 'OR'

interface ViewAdvancedFilterProps {
  title?: string
}

const ViewAdvancedFilter: React.FC<ViewAdvancedFilterProps> = ({
  title
}) => {

  const { model } = useModel()
  const setWheres = useSetModelState('wheres')
  const { getItems } = useModelGetItems()

  const [editValue, setEditValue] = React.useState([])

  const viewSchema = model
  if (!viewSchema || !viewSchema.properties) return <span style={{ fontSize: 12 }}>无可配置项</span>

  const querySchema = React.useMemo(() => {
    const cloned = cloneDeep(viewSchema)
    if (!cloned.properties) {
      cloned.properties = {}
    }
    return cloned
  }, [viewSchema])

  const onSearch = () => {
    const filter = getQueryFilter(editValue, viewSchema)
    setWheres((w: object) => ({ ...w, filter }));
    getItems()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{title || '高级筛选'}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>高级筛选</DialogTitle>
        </DialogHeader>
        <QueryEditor
          schema={querySchema as any}
          value={editValue}
          onChange={(v: any) => setEditValue(v)}
          timeRangeQuery={true}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={onSearch} type="submit">搜索</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ViewAdvancedFilter }
