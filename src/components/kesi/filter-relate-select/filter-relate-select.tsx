import React from 'react'
import { AsyncSelect } from '@/components/kesi/form-relate-async-select/form-relate-async-select'
import isArray from 'lodash/isArray'

interface FilterRelateSelectProps {
  value?: any
  onChange?: (value: any) => void
  name?: string
  label?: string
  displayField?: string
}

const FilterRelateSelect: React.FC<FilterRelateSelectProps> = props => {
  const { value, onChange, name, label, ...restProps } = props
  const multi = restProps.schema?.type === 'array'
  let defaultValue
  if (multi) {
    defaultValue = value?.or?.map((v: any) => ({ key: v?.[name]?.$regex })) || []
  } else {
    defaultValue = value?.in?.map((v: any) => ({ key: v })) || []
  }

  return <>
    {
      React.useMemo(() => (
        <AsyncSelect mode="multiple"
          value={defaultValue}
          onChange={(options) => {
            const ids = isArray(options) ? options.map((opt: any) => opt?.item?.id || opt?.key) : []
            if (multi) {
              onChange({
                or: ids.map((id: string) => {
                  return { [name]: { $regex: id } }
                })
              })
            } else {
              onChange({ in: ids })
            }
          }}
          field={restProps}
          {...restProps}
          label={label}
        />
      ), [multi, defaultValue?.map((v: any) => v?.key).join(',')])
    }
  </>
}

export { FilterRelateSelect }