import React from 'react'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const FilterBool = (props: any) => {
  const { value, onChange, boolLabel } = props
  const disabled = (value === null || value === undefined || value === '')

  return (
    <div className='w-full flex items-center justify-around gap-2'>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {disabled ? (
              <Checkbox
                checked={false}
                onCheckedChange={() => onChange(true)}
                className="border-blue-400/30"
              />
            ) : (
              <Checkbox
                checked={true}
                onCheckedChange={() => onChange(null)}
                className="border-blue-400/30"
              />
            )}
          </TooltipTrigger>
          <TooltipContent>
            <p>使用此过滤</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {' '}
      <Switch
        checked={value}
        disabled={disabled}
        onCheckedChange={onChange}
      />
      <span className="text-sm text-blue-200">
        {value ? (boolLabel?.[0] || '真') : (boolLabel?.[1] || '假')}
      </span>
    </div>
  )
}
FilterBool.displayName = "FilterBool"
export { FilterBool }
