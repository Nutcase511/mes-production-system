import * as React from 'react'
import isEmpty from 'lodash/isEmpty'
import { getFormValues } from '@/lib/form-relate-utils'
import { AsyncSelect } from '@/components/kesi/form-relate-async-select/form-relate-async-select'
import type { RelateFieldProps } from '@/lib/form-relate-types'

/**
 * RelateSelect - 单选关联字段组件
 * 外部工作表关联，单选模式
 */
const RelateSelect: React.FC<RelateFieldProps> = (props) => {
  const { onChange, value: item, field = {}, label, meta, record, disabled: propsDisabled } = props
  const { displayField = 'name', schema: relateSchema = {} } = field

  // 获取表单状态用于字段脚本
  const [formState] = React.useState<Record<string, any>>({})

  const disabled = propsDisabled || relateSchema.disabled || false

  // 默认值生效
  React.useEffect(() => {
    const defaultVal = relateSchema?.defaultVal
    setTimeout(() => {
      if (!item && defaultVal && onChange) {
        onChange(defaultVal)
      }
    })
  }, [])

  // 字段脚本部分
  React.useEffect(() => {
    const values = getFormValues(relateSchema, { values: formState })
    if (values && !isEmpty(values)) {
      // TODO: 实现字段脚本逻辑
      // useScriptVal({ schema: relateSchema, value: item, values, record, onChange })
    }
  }, [JSON.stringify(formState)])

  const handleChange = (option: any) => {
    if (!option || (Array.isArray(option) && option.length === 0)) {
      onChange?.(null)
    } else if (Array.isArray(option)) {
      onChange?.(option.map((item) => item.item))
    } else {
      onChange?.(option.item)
    }
  }

  return (
    <AsyncSelect
      value={
        item
          ? {
              key: item.id,
              label: item[displayField],
              item,
            }
          : null
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

export { RelateSelect }
