import { FilterArea } from "@/components/kesi/filter-area/filter-area"
import { FilterText } from '@/components/kesi/filter-text/filter-text'
import { FilterNumber } from '@/components/kesi/filter-number/filter-number'
import { FilterDate } from '@/components/kesi/filter-date/filter-date'
import { FilterBool } from '@/components/kesi/filter-bool/filter-bool'
import { FilterEnum } from '@/components/kesi/filter-enum/filter-enum'
import { FilterRelateSelect } from '@/components/kesi/filter-relate-select/filter-relate-select'
import { FilterDatetime } from '@/components/kesi/filter-datetime/filter-datetime'
// import { FilterInputSelect } from '@/registry/components/filter-input-select/filter-input-select'
// import { FilterRelateUnique } from '@/registry/components/filter-relate-unique/filter-relate-unique'
// import { FilterUserRole } from '@/registry/components/filter-user-role/filter-user-role'
// import { FilterSingleDate } from '@/registry/components/filter-single-date/filter-single-date'
// import { FilterWarningType } from '@/registry/components/filter-warning-type/filter-warning-type'
// import { FilterLogType } from '@/registry/components/filter-log-type/filter-log-type'
// import { FilterTextBoolean } from '@/registry/components/filter-text-boolean/filter-text-boolean'

const filterConverter = (schema: any, filterSchema: any) => {
  const controlType = filterSchema?.controlType || schema?.controlType
  if (!controlType) {
    const type = schema?.type
    const format = filterSchema?.format || schema?.format
    // 支持 enum1/enum_title1 (AIRIOT 字段格式) 和 enum/enumNames
    const isEnum = filterSchema?.enum1 || filterSchema?.enum || schema?.enum
    if (isEnum) {
      return FilterEnum
    } else if (['date', 'date-time', 'datetime'].includes(format)) {
      return format == 'date' ? FilterDate : FilterDatetime
    }
    switch (type) {
      case 'string':
        return FilterText
      case 'number':
        return FilterNumber
      case 'boolean':
        return FilterBool
      default:
        return FilterText
    }
  } else {
    switch (controlType) {
      case 'text':
      case 'link':
      case 'serial-number':
        return FilterText
      case 'area':
        return FilterArea
      case 'boolean':
        return FilterBool
      case 'date':
        return FilterDate
      case 'number':
        return FilterNumber
      case 'relate':
      case 'relate-multiple':
        return FilterRelateSelect
      case 'select-string':
      case 'select-number':
      case 'select-array-string':
      case 'select-array-number':
      case 'filter_enum':
        return FilterEnum
      default:
        return () => 'The filter component is defined'
    }
  }
}

export { filterConverter }
