import React, { useState } from 'react'
import { getSettings } from '@airiot/client'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WarningKindOption {
  id: string
  name: string
}

interface FilterWarningTypeProps {
  value?: any
  onChange?: (value: any) => void
  schema?: {
    title?: string
  }
}

const FilterWarningType: React.FC<FilterWarningTypeProps> = async ({ value, onChange, schema }) => {
  const [open, setOpen] = useState(false)

  // 从配置中获取报警类型列表
  const settings = await getSettings()
  const warningKinds: WarningKindOption[] = settings?.warning?.warningkind || [{
    id:
      "ada21497-888f-4f6d-acc3-cb04250d8037", name: "超限报警"
  }]

  // 初始化选中的值
  const getSelectedValues = (): string[] => {
    if (!value) return []
    if (typeof value === 'string') return [value]
    if (value.$in) return value.$in
    return []
  }

  const [selectedValues, setSelectedValues] = useState<string[]>(getSelectedValues())

  // 当外部值变化时同步
  React.useEffect(() => {
    setSelectedValues(getSelectedValues())
  }, [value])

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
    onChange?.(v)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined)
  }
  // 获取选中项的名称
  const getSelectedNames = () => {
    return warningKinds
      .filter(item => selectedValues.includes(item.id))
      .map(item => item.name)
  }

  const selectedNames = getSelectedNames()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-w-37.5',
            selectedValues.length > 0 && 'h-auto min-h-10 py-1'
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedNames.length > 0 ? (
              selectedNames.map((name, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {name}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer opacity-70 hover:opacity-100"
                    onClick={e => {
                      e.stopPropagation()
                      handleToggle(selectedValues[index])
                    }}
                  />
                </Badge>
              ))
            ) : (
              <span>{schema?.title || '请选择报警类型'}...</span>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {
              selectedNames.length > 0 ? (
                <div
                  onClick={handleClear}
                  className="cursor-pointer opacity-50 hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </div>
              ) : <ChevronDown className="h-4 w-4 opacity-50" />
            }
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2" align="start">
        <div className="space-y-1">
          {warningKinds.length > 0 ? (
            warningKinds.map(item => {
              const isSelected = selectedValues.includes(item.id)
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent transition-colors",
                    isSelected && "bg-accent"
                  )}
                  onClick={() => handleToggle(item.id)}
                >
                  <span className="flex-1">{item.name}</span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </div>
              )
            })
          ) : (
            <div className="text-sm text-muted-foreground py-2">暂无报警类型</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

FilterWarningType.displayName = "FilterWarningType"

export { FilterWarningType }
