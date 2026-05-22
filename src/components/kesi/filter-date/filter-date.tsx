import { useState } from 'react'
import isPlainObject from 'lodash/isPlainObject'
import { format, parse } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const FilterDate = (props: any) => {
  const [open, setOpen] = useState(false)
  const [tempRange, setTempRange] = useState<{ from?: Date; to?: Date } | undefined>(undefined)

  const datetimeFormat = props.datetimeFormat || 'yyyy-MM-dd'
  // 将 moment 格式转换为 date-fns 格式
  const dateFormat = datetimeFormat.replace('YYYY', 'yyyy').replace('DD', 'dd')

  const getValue = (value: { from: Date; to: Date }) => {    
    return {
      rule: 'range',
      gte: format(value.from, dateFormat),
      lte: format(value.to, dateFormat)
    }
  }

  const onRangeChange = (value: { from?: Date; to?: Date } | undefined) => {
    if (!value || !value.from) {
      setTempRange(undefined)
      return
    }
    setTempRange(value)
  }

  // 确认按钮点击处理
  const handleConfirm = () => {
    if (!tempRange || !tempRange.from) {
      return
    }
    // 如果只选了开始日期，将结束日期设为开始日期
    const value = {
      from: tempRange.from,
      to: tempRange.to || tempRange.from
    }
    props.onChange(getValue(value))
    setTempRange(undefined)
    setOpen(false)
  }

  // 处理 Popover 的开关状态
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // 打开时清空临时状态，让用户重新选择
      setTempRange(undefined)
      setOpen(true)
    } else {
      // 关闭时清空临时选择（未确认的选择）
      setTempRange(undefined)
      setOpen(false)
    }
  }

  let value = props.value
  let dateRange: { from: Date; to: Date } | undefined = undefined

  if (isPlainObject(value) && value.gte && value.lte) {
    try {
      const fromDate = parse(value.gte as string, dateFormat, new Date())
      const toDate = parse(value.lte as string, dateFormat, new Date())
      if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
        dateRange = {
          from: fromDate,
          to: toDate
        }
      }
    } catch (e) {
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal shrink bg-blue-500/10 border-blue-400/30 text-blue-200 hover:bg-blue-500/20",
            !dateRange && "placeholder:text-blue-300/50",
            props.className
          )}
        >
          {dateRange ? (
            `${format(dateRange.from, dateFormat)} - ${format(dateRange.to, dateFormat)}`
          ) : (
            "选择日期范围"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto min-w-[560px] p-0 bg-slate-900/95 border-blue-400/30"
        align="start"
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
      >
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Calendar
            mode="range"
            className="[&_.rdp-months]:gap-8 [&_.rdp-month]:min-w-[240px] [&_.rdp-month_caption]:text-blue-100 [&_.rdp-button_previous]:text-blue-200 [&_.rdp-button_next]:text-blue-200 [&_.rdp-weekday]:text-blue-300 [&_.rdp-day]:text-blue-100 [&_button[data-selected-single=true]]:bg-blue-500 [&_button[data-selected-single=true]]:text-white [&_button[data-range-start=true]]:bg-cyan-500 [&_button[data-range-end=true]]:bg-cyan-500 [&_button[data-range-middle=true]]:bg-cyan-500/20 [&_[data-range-middle]]:bg-cyan-500/20 [&_button[data-range-start=true]]:text-white [&_button[data-range-end=true]]:text-white [&_button:hover]:bg-blue-500/20 [&_.rdp-today]:text-cyan-400 [&_.rdp-today]:font-bold [&_.rdp-outside]:text-blue-300/40"
            selected={tempRange?.from ? { from: tempRange.from, to: tempRange.to } : (dateRange ? { from: dateRange.from, to: dateRange.to } : undefined)}
            onSelect={(range, _selectedDate, _modifiers, e) => {
              e?.stopPropagation()
              e?.preventDefault()
              onRangeChange(range)
            }}
            numberOfMonths={2}
          />
          <div className="flex justify-end p-3 border-t border-blue-400/30">
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleConfirm}>
              确定
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

FilterDate.displayName = "FilterDate"

export { FilterDate }
