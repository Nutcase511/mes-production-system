import isNil from 'lodash/isNil'
import isArray from 'lodash/isArray'
import isNumber from 'lodash/isNumber'
import dayjs from 'dayjs'
import { BooleanIcon } from '@/components/kesi/view-field-boolean/view-field-boolean'

const Reference = ({ value, schema }: { value: any; schema?: any }) => {
  if (value === 'computing') {
    return <span>计算中...</span>
  }

  if (isNil(value)) {
    return <span className="text-muted-foreground">空</span>
  }

  const fieldKey = schema?.searchRelate?.field?.key
  const fSchema = schema?.searchRelate?.field?.fieldSchema

  let displayValue = value

  // 排序
  if (['asc', 'desc'].includes(schema?.sort || '') && isArray(displayValue)) {
    displayValue = [...displayValue].sort((a, b) => {
      if (schema.sort === 'asc') return (a[fieldKey] || '') > (b[fieldKey] || '') ? 1 : -1
      return (a[fieldKey] || '') < (b[fieldKey] || '') ? 1 : -1
    })
  }

  // 条数限制
  if (schema?.numberLimit > 0 && isArray(displayValue)) {
    displayValue = displayValue.slice(0, schema.numberLimit)
  }

  // 数组渲染
  if (isArray(displayValue)) {
    return (
      <div className="flex flex-wrap gap-1">
        {displayValue.map((v: any, index: number) => {
          const val = v[fieldKey]
          const nf = schema?.numberFormat

          // 计数情况
          if (schema?.computeMethod === 'count') {
            return (
              <span key={index} className="inline-block border rounded px-2 py-0.5 text-xs">
                {val}
              </span>
            )
          }

          // 数字格式化
          if (nf && isNumber(val)) {
            let formattedVal: any = val
            if (nf === 'int') formattedVal = Math.round(val)
            else if (nf === 'float1') formattedVal = val.toFixed(1)
            else if (nf === 'float2') formattedVal = val.toFixed(2)
            else if (nf === '%') formattedVal = Math.round(val * 100) + '%'
            else if (nf === '%2') formattedVal = (val * 100) + '%'
            else formattedVal = dayjs(val).format(nf)

            return (
              <span key={index} className="inline-block border rounded px-2 py-0.5 text-xs">
                {formattedVal}
              </span>
            )
          }

          // 日期格式化
          if (nf) {
            return (
              <span key={index} className="inline-block border rounded px-2 py-0.5 text-xs">
                {dayjs(val).format(nf)}
              </span>
            )
          }

          // 布尔值
          if (fSchema?.type === 'boolean') {
            return (
              <span key={index} className="inline-flex items-center">
                <BooleanIcon value={val} />
              </span>
            )
          }

          // 默认
          return (
            <span key={index} className="inline-block border rounded px-2 py-0.5 text-xs">
              {val}
            </span>
          )
        })}
      </div>
    )
  }

  // 单值渲染
  return <span>{displayValue}</span>
}

export { Reference }
