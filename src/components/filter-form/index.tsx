import { ComponentProps } from 'react'
import FilterFormOriginal from '@/components/kesi/filter-form/filter-form'

type FilterFormProps = ComponentProps<typeof FilterFormOriginal> & {
  children?: React.ReactNode | ((methods: any) => React.ReactNode)
}

export const FilterForm = FilterFormOriginal as React.FC<FilterFormProps>
export default FilterForm