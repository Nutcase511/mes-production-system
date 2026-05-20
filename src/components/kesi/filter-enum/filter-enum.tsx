import { useState } from 'react'
import isString from 'lodash/isString'
import isObject from 'lodash/isObject'

import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const FilterEnum = (props: any) => {
  const { value, onChange, schema } = props
  const placeholder = schema && schema.placeholder
  const titleMap = schema && schema.enum ? schema.enum.map((k: string, index: number) => ({ value: k, name: schema.enumNames[index] || k })) : []
  const [open, setOpen] = useState(false)

  // 初始化选中的值
  let selected: string[] = []
  if (value && value != '') {
    if (isString(value)) selected = [value]
    if (isObject(value)) selected = (value as { $in?: string[] }).$in || []
  }
  const [selectedValues, setSelectedValues] = useState<string[]>(selected)

  const handleToggle = (itemValue: string) => {
    const newValues = selectedValues.includes(itemValue)
      ? selectedValues.filter(v => v !== itemValue)
      : [...selectedValues, itemValue]
    setSelectedValues(newValues)

    // 更新父组件的值
    let v = null
    if (newValues.length > 1) {
      v = { $in: newValues }
    } else if (newValues.length > 0) {
      v = newValues[0]
    }
    onChange(v)
  }

  // 清空选择
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(undefined)
    setSelectedValues([])
  }

  const getSelectedNames = () => {
    return titleMap
      ?.filter((item: any) => selectedValues.includes(item.value))
      .map((item: any) => item.name) || []
  }

  const selectedNames = getSelectedNames()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-w-37.5',
            selectedNames.length > 0 && 'h-auto min-h-10 py-1'
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedNames.length > 0 ? (
              selectedNames.map((name: string, index: number) => {
                const val = selectedValues[index]
                return (
                  <Badge key={val} variant="secondary" className="gap-1 pl-1 pr-1 py-0">
                    {name}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer opacity-70 hover:opacity-100"
                      onClick={e => {
                        e.stopPropagation()
                        handleToggle(val)
                      }}
                    />
                  </Badge>
                )
              })
            ) : (
              <span className='text-muted-foreground'>{placeholder || '请选择'}</span>
            )}
          </div>
          {
            selectedValues.length > 0 ? (
              <div
                onClick={handleClear}
                className="cursor-pointer opacity-50 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </div>
            ) : <ChevronDown className="h-4 w-4 opacity-50" />
          }
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2" align="start">
        <div className="space-y-1">
          {titleMap && titleMap.length > 0 ? (
            titleMap.map((item: any) => {
              const isSelected = selectedValues.includes(item.value)
              return (
                <div
                  key={item.value}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent transition-colors",
                    isSelected && "bg-accent"
                  )}
                  onClick={() => handleToggle(item.value)}
                >
                  <span className="flex-1">{item.name}</span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </div>
              )
            })
          ) : (
            <div className="text-sm text-muted-foreground py-2">暂无选项</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

FilterEnum.displayName = "FilterEnum"

export { FilterEnum }
