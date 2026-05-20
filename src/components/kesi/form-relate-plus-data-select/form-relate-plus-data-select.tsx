import * as React from 'react'
import { RelateSelect } from '@/components/kesi/form-relate-select/form-relate-select'
import { RelateMultiSelect } from '@/components/kesi/form-relate-multi-select/form-relate-multi-select'
import { RelateModelSelect } from '@/components/kesi/form-relate-model-select/form-relate-model-select'
import type { RelateFieldProps } from '@/lib/form-relate-types'

export interface FormRelatePlusDataSelectProps extends RelateFieldProps {
  schema: {
    relateTo?: string
    recordSelectType?: 'select' | 'modal'
    selectType?: 'single' | 'multiple'
    showType?: 'select' | 'card' | 'table'
    showField?: string
    allowAdd?: boolean
    editDisabled?: boolean
    createDisabled?: boolean
  } & Record<string, any>
  tableID?: string
}

const FormRelatePlusDataSelect: React.FC<FormRelatePlusDataSelectProps> = (props) => {
  const { schema, tableID, meta, field, value, onChange } = props

  // Determine which select component to use
  let SelectComponent: any = RelateModelSelect
  let extraProps: Record<string, any> = {}

  // User/Role special handling would go here if needed
  // For now, we use RelateSelect/RelateMultiSelect/RelateModelSelect based on recordSelectType

  if (!schema.recordSelectType || schema.recordSelectType === 'select') {
    if (schema.selectType === 'multiple') {
      SelectComponent = RelateMultiSelect
    } else {
      SelectComponent = RelateSelect
    }
  } else if (schema.recordSelectType === 'modal') {
    SelectComponent = RelateModelSelect
    // Set input type to button for card/table show types
    if (['card', 'table'].includes(schema.showType || '')) {
      extraProps.inputType = 'button'
    }
    extraProps.selectType = schema.selectType
  }

  // Handle disabled state
  const isDisabled = meta?.data?.disabled ?? schema.editDisabled ?? false

  if (isDisabled) {
    extraProps.disabled = true
    extraProps.schema = {
      ...schema,
      editDisabled: true,
      createDisabled: true,
    }
  }

  // 构建 field props，确保包含必要的 schema 信息
  const selectProps: any = {
    value,
    onChange,
    meta,
    field: {
      ...field,
      // 为 AsyncSelect 提供带 name 的 schema（与 schemaConverter 的格式一致）
      schema: tableID ? { name: `core/t/${tableID}/d` } : schema,
      displayField: schema.relate?.fields?.[0]?.key || schema.showField || 'name',
      tableID,
      relateShowFields: schema.relateShowFields,
    },
    ...extraProps,
  }
  return (
    <div className="flex flex-row w-full gap-2">
      <SelectComponent {...selectProps} />
    </div>
  )
}

export { FormRelatePlusDataSelect }
