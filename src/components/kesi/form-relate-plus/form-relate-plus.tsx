import * as React from 'react'
import { FormRelatePlusDataSelect } from '@/components/kesi/form-relate-plus-data-select/form-relate-plus-data-select'
import { FormRelatePlusAddRecordBtn } from '@/components/kesi/form-relate-plus-add-record-btn/form-relate-plus-add-record-btn'
import { FormRelatePlusDataShow } from '@/components/kesi/form-relate-plus-data-show/form-relate-plus-data-show'

export interface FormRelatePlusProps {
  schema: {
    relateTo?: string
    relate?: {
      id?: string
    }
    recordSelectType?: 'select' | 'modal'
    selectType?: 'single' | 'multiple'
    showType?: 'select' | 'card' | 'table'
    showField?: string
    allowAdd?: boolean
    editDisabled?: boolean
    createDisabled?: boolean
    relateShowFields?: Array<{
      key: string
      title: string
      fieldSchema?: any
    }>
  } & Record<string, any>
  tableID?: string
  input?: {
    value?: any
    onChange?: (value: any) => void
  }
  value?: any
  onChange?: (value: any) => void
  field?: {
    schema?: Record<string, any>
    displayField?: string
    relateShowFields?: Array<{
      key: string
      title: string
      fieldSchema?: any
    }>
  }
  meta?: {
    data?: {
      disabled?: boolean
    }
  }
}

const FormRelatePlus: React.FC<FormRelatePlusProps> = (props) => {

  if (!props.schema) {
    return <div className="text-sm text-red-500">关联字段配置错误：缺少 schema</div>
  }
  return (
    <div className="flex flex-col items-stretch w-full gap-2">
      <div className="flex flex-row gap-2">
        <FormRelatePlusDataSelect {...props} />
        <FormRelatePlusAddRecordBtn {...props} />
      </div>
      <FormRelatePlusDataShow {...props} />
    </div>
  )
}

export { FormRelatePlus }
