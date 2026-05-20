import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format as formatFn } from "date-fns"
import { zhCN } from "date-fns/locale"

export interface DateRangeProps {
  /** 日期格式：date-日期, datetime-日期时间, time-时间 */
  format?: 'date' | 'datetime' | 'time'
  /** 是否禁用 */
  disabled?: boolean
  /** 值 */
  value?: string
  /** 变化回调 */
  onChange?: (value: string | null) => void
  /** 占位符 */
  placeholder?: string
  /** 自定义样式类名 */
  className?: string
}

const DateRange = React.forwardRef<HTMLDivElement, DateRangeProps>(
  (
    {
      format = 'date',
      disabled = false,
      value,
      onChange,
      placeholder = '请选择日期范围',
      className,
      ...props
    },
    ref
  ) => {
    const [startDate, setStartDate] = React.useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = React.useState<Date | undefined>(undefined)
    const [isStartOpen, setIsStartOpen] = React.useState(false)
    const [isEndOpen, setIsEndOpen] = React.useState(false)

    React.useEffect(() => {
      if (value && value.includes(' - ')) {
        const [start, end] = value.split(' - ')
        if (start) setStartDate(new Date(start))
        if (end) setEndDate(new Date(end))
      } else if (!value) {
        setStartDate(undefined)
        setEndDate(undefined)
      }
    }, [value])

    const handleStartDateChange = (date: Date | undefined) => {
      setStartDate(date)
      if (endDate) {
        const startStr = formatRangeValue(date, endDate)
        onChange?.(startStr)
      } else {
        onChange?.(date ? formatRangeValue(date, undefined) : null)
      }
      setIsStartOpen(false)
    }

    const handleEndDateChange = (date: Date | undefined) => {
      setEndDate(date)
      if (startDate) {
        const endStr = formatRangeValue(startDate, date)
        onChange?.(endStr)
      } else {
        onChange?.(date ? formatRangeValue(undefined, date) : null)
      }
      setIsEndOpen(false)
    }

    const formatRangeValue = (start: Date | undefined, end: Date | undefined): string | null => {
      if (!start && !end) return null
      if (!start) return ` - ${formatDateValue(end!, format)}`
      if (!end) return `${formatDateValue(start!, format)} - `
      return `${formatDateValue(start!, format)} - ${formatDateValue(end!, format)}`
    }

    const formatDateValue = (date: Date, formatType: string): string => {
      const dateObj = new Date(date)
      if (formatType === 'date') {
        return formatFn(dateObj, 'yyyy-MM-dd')
      } else if (formatType === 'datetime') {
        return formatFn(dateObj, 'yyyy-MM-dd HH:mm:ss')
      } else if (formatType === 'time') {
        return formatFn(dateObj, 'HH:mm:ss')
      }
      return formatFn(dateObj, 'yyyy-MM-dd')
    }

    const handleClear = () => {
      setStartDate(undefined)
      setEndDate(undefined)
      onChange?.(null)
    }

    return (
      <div
        ref={ref}
        className={cn(
          "date-range-component flex items-center gap-2 w-full",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        {...props}
      >
        <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              {startDate ? formatDateValue(startDate, format) : <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            {format === 'date' && (
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartDateChange}
                initialFocus
              />
            )}
            {format === 'datetime' && (
              <div className="flex gap-2 p-2">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateChange}
                  initialFocus
                  locale={zhCN}
                />
                <input
                  type="time"
                  value={startDate ? formatFn(startDate, 'HH:mm:ss') : ''}
                  onChange={(e) => {
                    if (startDate) {
                      const [hours='00', minutes='00', seconds='00'] = e.target.value.split(':')
                      const newDate = new Date(startDate)
                      newDate.setHours(Number(hours), Number(minutes), Number(seconds))
                      handleStartDateChange(newDate)
                    }
                  }}
                  className="border rounded px-2 py-1"
                />
              </div>
            )}
            {format === 'time' && (
              <div className="flex gap-2 p-2">
                <input
                  type="time"
                  value={startDate ? formatFn(startDate, 'HH:mm:ss') : ''}
                  onChange={(e) => {
                    const [hours='00', minutes='00', seconds='00'] = e.target.value.split(':')
                    const newDate = new Date()
                    newDate.setHours(Number(hours), Number(minutes), Number(seconds))
                    handleStartDateChange(newDate)
                  }}
                  className="border rounded px-2 py-1"
                />
              </div>
            )}
          </PopoverContent>
        </Popover>

        <span className="text-slate-400">-</span>

        <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              {endDate ? formatDateValue(endDate, format) : <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            {format === 'date' && (
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleEndDateChange}
                initialFocus
              />
            )}
            {format === 'datetime' && (
              <div className="flex gap-2 p-2">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateChange}
                  initialFocus
                  locale={zhCN}
                />
                <input
                  type="time"
                  value={endDate ? formatFn(endDate, 'HH:mm:ss') : ''}
                  onChange={(e) => {
                    if (endDate) {
                      const [hours='00', minutes='00', seconds='00'] = e.target.value.split(':')
                      const newDate = new Date(endDate)
                      newDate.setHours(Number(hours), Number(minutes), Number(seconds))
                      handleEndDateChange(newDate)
                    }
                  }}
                  className="border rounded px-2 py-1"
                />
              </div>
            )}
            {format === 'time' && (
              <div className="flex gap-2 p-2">
                <input
                  type="time"
                  value={endDate ? formatFn(endDate, 'HH:mm:ss') : ''}
                  onChange={(e) => {
                    const [hours='00', minutes='00', seconds='00'] = e.target.value.split(':')
                    const newDate = new Date()
                    newDate.setHours(Number(hours), Number(minutes), Number(seconds))
                    handleEndDateChange(newDate)
                  }}
                  className="border rounded px-2 py-1"
                />
              </div>
            )}
          </PopoverContent>
        </Popover>

        {(startDate || endDate) && (
          <Button
            onClick={handleClear}
            disabled={disabled}
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-slate-600"
            title="清除"
          >
            ×
          </Button>
        )}
      </div>
    )
  }
)

DateRange.displayName = "DateRange"

export { DateRange, DateRange as FormDateRange }
