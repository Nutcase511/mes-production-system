import * as React from 'react'
import isEmpty from 'lodash/isEmpty'
import isArray from 'lodash/isArray'
import { getFormValues } from '@/lib/form-relate-utils'
import { AsyncSelect } from '@/components/kesi/form-relate-async-select/form-relate-async-select'
import type { RelateFieldProps } from '@/lib/form-relate-types'

/**
 * RelateMultiSelect - 多选关联字段组件
 * 外部工作表关联，多选模式
 */
const RelateMultiSelect: React.FC<RelateFieldProps> = (props) => {
  const { onChange, value: items, field = {}, label, meta, record, disabled: propsDisabled } = props
  const { displayField = 'name', schema: relateSchema = {} } = field

  // 获取表单状态用于字段脚本
  const [formState] = React.useState<Record<string, any>>({})

  const disabled = propsDisabled || relateSchema.disabled || false

  // 默认值生效
  React.useEffect(() => {
    const defaultVal = relateSchema?.defaultVal
    setTimeout(() => {
      if (!items && defaultVal && onChange) {
        onChange(defaultVal)
      }
    })
  }, [])

  // 字段脚本部分
  React.useEffect(() => {
    const values = getFormValues(relateSchema, { values: formState })
    if (values && !isEmpty(values)) {
      // TODO: 实现字段脚本逻辑
      // useScriptVal({ schema: relateSchema, value: items, values, record, onChange })
    }
  }, [JSON.stringify(formState)])

  const handleChange = (options: any[]) => {
    if (!options || options.length === 0) {
      onChange?.([])
    } else {
      onChange?.(options.map((opt) => opt.item))
    }
  }

  return (
    <AsyncSelect
      mode="multiple"
      value={
        items && !isEmpty(items) && isArray(items)
          ? items.map((item: any) => ({
              key: item.id,
              label: item[displayField],
              item,
            }))
          : []
      }
      onChange={handleChange}
      field={field}
      label={label}
      disabled={disabled}
      meta={meta}
      record={record}
    />
  )
}

export { RelateMultiSelect }
