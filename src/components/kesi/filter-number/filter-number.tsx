import React from 'react'
import isNil from 'lodash/isNil'
import pickBy from 'lodash/pickBy'
import isNumber from 'lodash/isNumber'
import isEmpty from 'lodash/isEmpty'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const FilterNumber = (props: any) => {
  const { name, value, onBlur, onChange, ...inputProps } = props

  const gte = !isNil(value?.gte) ? value.gte : ''
  const lte = !isNil(value?.lte) ? value.lte : ''

  const inputChange = (v: any, k: 'gte' | 'lte') => {
    const num = v === '' ? null : Number(v)
    const vs = pickBy({ ...value, [k]: num }, isNumber)
    onChange(isEmpty(vs) ? null : vs)
  }

  return (
    <div className="inline-flex items-center gap-2">
      <Input
        {...inputProps}
        type="number"
        className={cn(props.style?.width ? 'w-auto' : 'w-24')}
        style={props.style}
        value={gte}
        placeholder={props.minimum ? `最小值(${props.minimum})` : '无限制'}
        onChange={(e) => inputChange(e.target.value, 'gte')}
      />
      <span className="text-muted-foreground">~</span>
      <Input
        {...inputProps}
        type="number"
        className={cn(props.style?.width ? 'w-auto' : 'w-24')}
        style={props.style}
        value={lte}
        placeholder={props.maximum ? `最大值(${props.maximum})` : '无限制'}
        onChange={(e) => inputChange(e.target.value, 'lte')}
      />
    </div>
  )
}
FilterNumber.displayName = "FilterNumber"
export { FilterNumber }
