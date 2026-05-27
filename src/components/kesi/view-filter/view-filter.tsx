import React from 'react';
import { useModel, useSetModelState, useModelGetItems } from '@airiot/client';
import { FilterForm } from '@/components/kesi/filter-form/filter-form';
import type { FormSchemaItem } from '@/lib/model-types';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw } from 'lucide-react';

interface ViewFilterProps {
  filters?: FormSchemaItem[]
  schema?: any
  classNames?: Record<'form' | 'group' | 'field' | 'label' | 'input' | 'description' | 'error', string>
  children?: React.ReactNode | ((props: { reset: () => void }) => React.ReactNode)
  actions?: React.ReactNode
}

const ViewFilter: React.FC<ViewFilterProps> = ({
  filters,
  schema,
  classNames,
  children,
  actions
}) => {
  const { model } = useModel()
  const setWheres = useSetModelState('wheres')
  const { getItems } = useModelGetItems()

  const filterSchema = filters && filters.length > 0 ? filters : model.filterSchema

  const onSubmit = (value: any) => {
    setWheres((w: any) => ({ ...w, filter: { ...w.filter, ...value } }));
    getItems()
  }

  const onReset = (reset: () => void) => {
    reset()
    setWheres((w: any) => ({ ...w, filter: {} }));
    getItems()
  }

  const defaultClassNames = {
    form: 'flex flex-row items-end gap-4 flex-wrap w-full',
    group: 'flex flex-row items-end gap-4 flex-1 min-w-0',
    field: 'w-auto',
    label: 'text-blue-200 whitespace-nowrap',
    input: 'bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50 w-auto',
    description: '',
    error: ''
  }

  return (
    <div className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4 mb-4"
      style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
      <FilterForm
        formId={model?.key + 'view-filter'}
        schema={schema ? schema : model}
        filterSchema={filterSchema}
        classNames={classNames || defaultClassNames}
        onSubmit={onSubmit}>
        {(methods) => (
          <div className="flex items-center gap-2">
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 h-9 text-sm">
              <Search className="h-4 w-4 mr-1" />
              搜索
            </Button>
            <Button type="button" variant="outline" className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20 px-4 py-1.5 h-9 text-sm" onClick={() => onReset(methods.reset)}>
              <RotateCcw className="h-4 w-4 mr-1" />
              重置
            </Button>
            {actions}
            {typeof children === 'function' ? children({ reset: methods.reset }) : children}
          </div>
        )}
      </FilterForm>
    </div>
  )
}

export { ViewFilter };
export default ViewFilter;
