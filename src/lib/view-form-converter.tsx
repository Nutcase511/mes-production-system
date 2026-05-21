import { FormArea } from '@/components/kesi/form-area/form-area'
import { FormSwitch } from '@/components/kesi/form-switch/form-switch'
import { FormUserRole } from '@/components/kesi/form-user-role/form-user-role'
import { FormDate } from '@/components/kesi/form-date/form-date'
import { FormDateRange } from '@/components/kesi/form-date-range/form-date-range'
import { FormLink } from '@/components/kesi/form-link/form-link'
import { FormMap } from '@/components/kesi/form-map/form-map'
import { FormInputNumber } from '@/components/kesi/form-input-number/form-input-number'
import { Rate } from '@/components/kesi/form-rate/form-rate'
import { FormRelate as FormRelateOld } from '@/components/kesi/form-relate/form-relate'
import { FormSelect } from '@/components/kesi/form-select/form-select'
import { FormSerialNumber } from '@/components/kesi/form-serial-number/form-serial-number'
import { FormEditableTable } from '@/components/kesi/form-editable-table/form-editable-table'
import { FormInput } from '@/components/kesi/form-input/form-input'
import { FormTextarea } from '@/components/kesi/form-textarea/form-textarea'
import { FormTime } from '@/components/kesi/form-time/form-time'
import { FormUpload, FormUploadGroup } from '@/components/kesi/form-upload/form-upload'
import { FormRichText } from '@/components/kesi/form-rich-text/form-rich-text'
import { FormBytesArray } from '@/components/kesi/form-bytes-array/form-bytes-array'
import { FormRadio } from '@/components/kesi/form-radio/form-radio'
import { FormCheckbox } from '@/components/kesi/form-checkbox/form-checkbox'
import { FormSlider } from '@/components/kesi/form-slider/form-slider'
import { FormFormInfo } from '@/components/kesi/form-form-info/form-form-info'
import { RelateModelSelect as TableSelect } from '@/components/kesi/form-relate-model-select/form-relate-model-select'
import { FormRelatePlusDataSelect as TableDataSelect } from '@/components/kesi/form-relate-plus-data-select/form-relate-plus-data-select'
import { FormArray } from '@/components/kesi/form-array/form-array'
import { FormObject } from '@/components/kesi/form-object/form-object'
import { FormReference } from '@/components/kesi/form-reference/form-reference'
import { RelateMultiSelect as FormMultiSelect } from '@/components/kesi/form-relate-multi-select/form-relate-multi-select'
import { RelateSelect as FormNumberSelect } from '@/components/kesi/form-relate-select/form-relate-select'
import { FormRelatePlusDataSelect as FormNumberMultiSelect } from '@/components/kesi/form-relate-plus-data-select/form-relate-plus-data-select'

const formConverter = (schema: any, formSchema: any) => {
  const controlType = formSchema?.controlType || schema?.controlType

  if (!controlType) {
    const type = schema.type
    const format = formSchema.format || schema.format
    const isEnum = formSchema.enum || schema.enum
    
    // 优先检查关联字段
    if (schema.relate || schema.relateTo || schema.relateSchema) {
      return FormRelateOld
    }
    
    if (isEnum) {
      switch (type) {
        case 'string':
          return FormSelect
        case 'number':
          return FormNumberSelect
        case 'array':
          if (schema.items?.type === 'string') {
            return FormMultiSelect
          } else if (schema.items?.type === 'number') {
            return FormNumberMultiSelect
          }
      }
    } else if (['date', 'date-time', 'datetime'].includes(format)) {
      return FormDate
    } else if (format === 'time') {
      return FormTime
    }
    switch (type) {
      case 'string':
        return FormInput
      case 'number':
        return FormInputNumber
      case 'boolean':
        return FormSwitch
      case 'array':
        return FormArray
      case 'object':
        return FormObject
      default:
        return FormInput
    }
  } else {
    switch (controlType) {
      case 'area':
        return FormArea
      case 'boolean':
      case 'switch':
        return FormSwitch
      case 'user-role':
        return FormUserRole
      case 'date':
        return FormDate
      case 'date-range':
        return FormDateRange
      case 'link':
        return FormLink
      case 'map':
        return FormMap
      case 'number':
        return FormInputNumber
      case 'rate':
        return Rate
      case 'relate':
      case 'relate-multiple':
        return FormRelateOld
      case 'select-string':
        return FormSelect
      case 'select-number':
        return FormNumberSelect
      case 'select-array-string':
        return FormMultiSelect
      case 'select-array-number':
        return FormNumberMultiSelect
      case 'serial-number':
        return FormSerialNumber
      case 'editable-table':
        return FormEditableTable
      case 'text':
        return FormInput
      case 'textarea':
        return FormTextarea
      case 'time':
        return FormTime
      case 'upload':
        return FormUpload
      case 'upload-group':
        return FormUploadGroup
      case 'rich-text':
        return FormRichText
      case 'bytes-array':
        return FormBytesArray
      case 'radio':
        return FormRadio
      case 'checkbox':
        return FormCheckbox
      case 'slider':
        return FormSlider
      case 'table-select':
        return TableSelect
      case 'table-data':
        return TableDataSelect
      case 'form-info':
        return FormFormInfo
      case 'reference':
        return FormReference
      case 'array':
        return FormArray
      case 'object':
        return FormObject
      default:
        return () => 'The form field component is defined'
    }
  }
}

export { formConverter }
