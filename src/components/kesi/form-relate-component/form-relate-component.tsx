import * as React from 'react'
import { FormRelate as FormRelatePure } from '@/components/kesi/form-relate/form-relate'
import { RelateSelect } from '@/components/kesi/form-relate-select/form-relate-select'
import { RelateMultiSelect } from '@/components/kesi/form-relate-multi-select/form-relate-multi-select'
import { RelateModelSelect } from '@/components/kesi/form-relate-model-select/form-relate-model-select'
import type { RelateFieldProps } from '@/lib/form-relate-types'
import { useFormContext } from '@airiot/client'
import { Table2Context } from '@/lib/table-context'
import { dealFilter } from '@/lib/form-relate-utils'

/**
 * FormRelate - 关联字段容器组件
 * 根据 field.schema 配置自动分发到对应的子组件：
 * - FormRelatePure: 内部表关联 (internalTable=true)
 * - RelateSelect: 外部工作表单选 (默认单选)
 * - RelateMultiSelect: 外部工作表多选 (selectType='multiple')
 * - RelateModelSelect: 弹窗表格选择 (有 relateShowFields)
 *
 * 对于内部表关联，此组件负责构建 filterObj 并传递给纯组件 FormRelatePure
 */
const FormRelate: React.FC<RelateFieldProps> = (props) => {
  const { field = {}, schema = {}, value, onChange, meta, record, disabled, label } = props

  // 判断是否为内部表关联
  const isInternalTable = schema.internalTable !== false

  // 获取选择类型
  const selectType = schema.selectType || 'single'

  // 判断是否有多个展示字段（使用弹窗表格选择器）
  const hasMultiFields = schema.relateShowFields && schema.relateShowFields.length > 0

  // 判断是否为详情展示模式
  const isDetailShow = schema.recordSelectType === 'show'

  // 获取表单和表格上下文（用于构建 filterObj）
  const form = useFormContext()
  const outTable = React.useContext(Table2Context)

  const getFormState = () => {
    if (form) {
      return form.getValues()
    }
  }

  // 构建过滤器对象
  const filterObj = React.useMemo(() => {
    const result: Record<string, any> = {}
    dealFilter(result, field, getFormState, outTable)
    return result
  }, [field, form, outTable])

  // ==================== 分发逻辑 ====================

  // 1. 详情展示模式
  if (isDetailShow) {
    // TODO: 如果需要支持 DetailShow，可以在这里处理
    // 目前返回 null，由调用方处理
    return null
  }

  // 2. 内部表关联 - 使用 FormRelatePure（纯组件）
  if (isInternalTable) {
    return (
      <FormRelatePure
        value={value}
        onChange={onChange}
        schema={schema}
        meta={meta}
        record={record}
        disabled={disabled}
        filterObj={filterObj}
      />
    )
  }

  // 3. 外部表关联 - 根据是否有多字段和选择类型分发

  // 3.1 有多个展示字段 - 使用弹窗表格选择器
  if (hasMultiFields) {
    // 构建完整的 field 对象传给 RelateModelSelect
    const modelSelectField = {
      ...field,
      schema: {
        ...schema,
        name: schema.relate?.id ? `core/t/${schema.relate.id}/d` : undefined,
      },
      displayField: schema.relate?.fields?.[0]?.key || 'name',
    }

    return (
      <RelateModelSelect
        value={value}
        onChange={onChange}
        field={modelSelectField}
        meta={meta}
        record={record}
        disabled={disabled}
        label={label || schema.title}
        selectType={selectType}
        inputType={schema.inputType || 'select'}
        allFieldReturn={schema.allFieldReturn || false}
        insideFilter={schema.insideFilter}
      />
    )
  }

  // 3.2 多选模式 - 使用 RelateMultiSelect
  if (selectType === 'multiple') {
    const multiSelectField = {
      ...field,
      displayField: schema.relate?.fields?.[0]?.key || 'name',
      schema: {
        ...schema,
        name: schema.relate?.id ? `core/t/${schema.relate.id}/d` : undefined,
      },
    }

    return (
      <RelateMultiSelect
        value={value}
        onChange={onChange}
        field={multiSelectField}
        meta={meta}
        record={record}
        disabled={disabled}
        label={label || schema.title}
      />
    )
  }

  // 3.3 默认单选模式 - 使用 RelateSelect
  const selectField = {
    ...field,
    displayField: schema.relate?.fields?.[0]?.key || 'name',
    schema: {
      ...schema,
      name: schema.relate?.id ? `core/t/${schema.relate.id}/d` : undefined,
    },
  }

  return (
    <RelateSelect
      value={value}
      onChange={onChange}
      field={selectField}
      meta={meta}
      record={record}
      disabled={disabled}
      label={label || schema.title}
    />
  )
}

export { FormRelate }