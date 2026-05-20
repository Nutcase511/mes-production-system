import React from 'react';
import { useModel, useSetModelState, useModelGetItems } from '@airiot/client';
import { FilterForm } from '@/components/kesi/filter-form/filter-form';
import type { ModelSchema } from '@/lib/model-types';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw } from 'lucide-react';
interface ViewFilterProps {
  filters?: Array<{
    key: string
  }>
  schema?: ModelSchema
  classNames?: Record<'form' | 'group' | 'field' | 'label' | 'input' | 'description' | 'error', string>
}


const ViewFilter: React.FC<ViewFilterProps> = ({
  filters = [],
  schema,
  classNames
}) => {
  const { model } = useModel()
  const setWheres = useSetModelState('wheres')
  const { getItems } = useModelGetItems()

  const filterSchema = filters && filters.length > 0 ? filters : model.filterSchema

  const onSubmit = (value: any) => {    
    setWheres((w: any) => {
      return { ...w, filter: { ...w.filter, ...value } }
    });
    getItems()
  }

  const onReset = (reset: () => void) => {
    // 重置表单
    reset()
    // 重置查询条件
    setWheres((w: any) => {
      return { ...w, filter: {} }
    });
    getItems()
  }

  return (
    <FilterForm
      formId={model?.key + 'view-filter'}
      schema={schema ? schema : model}
      filterSchema={filterSchema}
      classNames={classNames ? classNames : {
        form: '',
        group: 'grid grid-cols-3 gap-4',
        field: 'flex flex-row items-center gap-2 min-w-0',
        label: '!w-20 flex-shrink-0 text-right',
        input: 'flex-1 min-w-0',
        description: '',
        error: ''
      }}
      onSubmit={onSubmit}>
      {(methods) => (
        <div className="mt-4 flex justify-center gap-3">
          <Button type="submit">
            <Search />
            搜索
          </Button>
          <Button type="button" variant="outline" onClick={() => onReset(methods.reset)}>
            <RotateCcw />
            重置
          </Button>
        </div>
      )}
    </FilterForm>
  )
}

export { ViewFilter };
export default ViewFilter;
