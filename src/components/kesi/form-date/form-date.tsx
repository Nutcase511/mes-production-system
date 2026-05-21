import * as React from "react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, XIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TimePicker } from "@/components/ui/time-picker"

export interface FormDateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> {
  /**
   * 清除按钮
   */
  allowClear?: boolean
  /**
   * 自动获取焦点
   */
  autoFocus?: boolean
  /**
   * 是否有边框
   */
  bordered?: boolean
  /**
   * 禁用
   */
  disabled?: boolean
  /**
   * 选择器类型
   */
  picker?: "time" | "date" | "dateTime" | "week" | "month" | "quarter" | "year"
  /**
   * 日历展开
   */
  isCalendar?: boolean
  /**
   * 提示文字
   */
  placeholder?: string
  /**
   * 12小时制
   */
  use12Hours?: boolean
  /**
   * 当前值
   */
  value?: string
  /**
   * 默认值
   */
  defaultValue?: string
  /**
   * 值变化回调
   */
  onChange?: (value: string) => void
}

// 季度选择器
interface QuarterPickerRef {
  handleConfirm: () => void
}

const QuarterPicker = React.forwardRef<QuarterPickerRef, {
  date?: Date
  onSelect: (date: Date) => void
  disabled?: boolean
  onConfirm?: () => void
}>(({ date, onSelect, disabled, onConfirm }, ref) => {
  const currentYear = date?.getFullYear() || new Date().getFullYear()
  const currentQuarter = date ? Math.floor(date.getMonth() / 3) + 1 : 0

  const [displayYear, setDisplayYear] = React.useState(currentYear)
  const [selectedQuarter, setSelectedQuarter] = React.useState(currentQuarter)

  // 初始化时同步状态
  React.useEffect(() => {
    setDisplayYear(currentYear)
    setSelectedQuarter(currentQuarter)
  }, [currentYear, currentQuarter])

  const quarters = [
    { value: 1, label: 'Q1', months: [0, 1, 2] },
    { value: 2, label: 'Q2', months: [3, 4, 5] },
    { value: 3, label: 'Q3', months: [6, 7, 8] },
    { value: 4, label: 'Q4', months: [9, 10, 11] }
  ]

  const handleQuarterSelect = (quarter: number) => {
    setSelectedQuarter(quarter)
  }

  const handlePrevYear = () => {
    setDisplayYear(displayYear - 1)
  }

  const handleNextYear = () => {
    setDisplayYear(displayYear + 1)
  }

  const handleConfirm = () => {
    if (selectedQuarter > 0) {
      const month = (selectedQuarter - 1) * 3
      const newDate = new Date(displayYear, month, 1)
      onSelect(newDate)
    }
    onConfirm?.()
  }

  // 暴露确认方法供父组件调用
  React.useImperativeHandle(ref, () => ({ handleConfirm }), [selectedQuarter, displayYear, onSelect, onConfirm])

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevYear}
          disabled={disabled}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-lg font-semibold">{displayYear}年</div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextYear}
          disabled={disabled}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-2">
        {quarters.map((q) => (
          <Button
            key={q.value}
            variant={selectedQuarter === q.value ? "default" : "outline"}
            onClick={() => handleQuarterSelect(q.value)}
            disabled={disabled}
            className="h-10 text-lg"
          >
            {q.label}
          </Button>
        ))}
      </div>
    </div>
  )
})

// 月份选择器
interface MonthPickerRef {
  handleConfirm: () => void
}

const MonthPicker = React.forwardRef<MonthPickerRef, {
  date?: Date
  onSelect: (date: Date) => void
  disabled?: boolean
  onConfirm?: () => void
}>(({ date, onSelect, disabled, onConfirm }, ref) => {
  const currentYear = date?.getFullYear() || new Date().getFullYear()
  const currentMonth = date?.getMonth() ?? -1

  const [displayYear, setDisplayYear] = React.useState(currentYear)
  const [selectedMonth, setSelectedMonth] = React.useState(currentMonth)

  // 初始化时同步状态
  React.useEffect(() => {
    setDisplayYear(currentYear)
    setSelectedMonth(currentMonth)
  }, [currentYear, currentMonth])

  const months = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ]

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month)
  }

  const handlePrevYear = () => {
    setDisplayYear(displayYear - 1)
  }

  const handleNextYear = () => {
    setDisplayYear(displayYear + 1)
  }

  const handleConfirm = () => {
    if (selectedMonth >= 0) {
      const newDate = new Date(displayYear, selectedMonth, 1)
      onSelect(newDate)
    }
    onConfirm?.()
  }

  // 暴露确认方法供父组件调用
  React.useImperativeHandle(ref, () => ({ handleConfirm }), [selectedMonth, displayYear, onSelect, onConfirm])

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevYear}
          disabled={disabled}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-lg font-semibold">{displayYear}年</div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextYear}
          disabled={disabled}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {months.map((month, index) => (
          <Button
            key={index}
            variant={selectedMonth === index ? "default" : "outline"}
            onClick={() => handleMonthSelect(index)}
            disabled={disabled}
            className="h-8"
          >
            {month}
          </Button>
        ))}
      </div>
    </div>
  )
})

// 周选择器
const WeekPicker = ({
  date,
  month,
  onSelect,
  onMonthChange,
  disabled
}: {
  date?: Date
  month?: Date
  onSelect: (date: Date) => void
  onMonthChange: (date: Date | undefined) => void
  disabled?: boolean
}) => {
  // 计算选中日期所在周的起止日期（上周日到本周六）
  const getWeekRange = (selectedDate: Date | undefined) => {
    if (!selectedDate) return { start: undefined, end: undefined }

    const d = new Date(selectedDate)
    const day = d.getDay()
    const start = new Date(d)
    start.setDate(d.getDate() - day)
    start.setHours(0, 0, 0, 0)

    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)

    return { start, end }
  }

  const { start: weekStart, end: weekEnd } = getWeekRange(date)

  // modifiers 函数：判断日期是否在选中周内
  const isWeekSelected = React.useCallback((day: Date) => {
    if (!weekStart || !weekEnd) return false
    const time = day.getTime()
    return time >= weekStart.getTime() && time <= weekEnd.getTime()
  }, [weekStart, weekEnd])

  // 包装 onSelect 以处理 undefined
  const handleSelect = React.useCallback((selectedDate: Date | undefined) => {
    if (selectedDate) {
      onSelect(selectedDate)
    }
  }, [onSelect])

  return (
    <Calendar
      mode="single"
      required={false}
      selected={date}
      month={month}
      onMonthChange={onMonthChange}
      onSelect={handleSelect}
      disabled={disabled}
      modifiers={{
        weekSelected: isWeekSelected
      }}
      modifiersClassNames={{
        weekSelected: "bg-primary/20"
      }}
      className="[&_.rdp-day[data-selected=true]:!rounded-md [&_.rdp-day[data-modifier-weekSelected=true]:rounded-none [&_.rdp-week_.rdp-day:first-child[data-modifier-weekSelected=true]:rounded-l-md [&_.rdp-week_.rdp-day:last-child[data-modifier-weekSelected=true]:rounded-r-md"
      numberOfMonths={1}
    />
  )
}

// 年份选择器
const YearPicker = ({
  date,
  onSelect,
  disabled
}: {
  date?: Date
  onSelect: (date: Date) => void
  disabled?: boolean
}) => {
  const currentYear = date?.getFullYear() || new Date().getFullYear()
  const [displayYear, setDisplayYear] = React.useState(currentYear)

  React.useEffect(() => {
    setDisplayYear(currentYear)
  }, [currentYear])

  const startYear = Math.floor(displayYear / 10) * 10 - 1
  const years = Array.from({ length: 12 }, (_, i) => startYear + i)

  const handleYearSelect = (year: number) => {
    const newDate = new Date(year, 0, 1)
    onSelect(newDate)
  }

  const handlePrevDecade = () => {
    setDisplayYear(displayYear - 10)
  }

  const handleNextDecade = () => {
    setDisplayYear(displayYear + 10)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevDecade}
          disabled={disabled}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-lg font-semibold">
          {startYear + 1}-{startYear + 10}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextDecade}
          disabled={disabled}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {years.map((year) => (
          <Button
            key={year}
            variant={currentYear === year ? "default" : "outline"}
            onClick={() => handleYearSelect(year)}
            disabled={disabled || year < startYear || year > startYear + 11}
            className={cn(
              year < startYear || year > startYear + 11 ? "invisible" : ""
            )}
          >
            {year}
          </Button>
        ))}
      </div>
    </div>
  )
}

const FormDate = React.forwardRef<HTMLDivElement, FormDateProps>(
  (
    {
      allowClear = true,
      autoFocus = false,
      bordered = true,
      disabled = false,
      picker = "date",
      isCalendar = false,
      placeholder = "请选择日期",
      use12Hours = false,
      value,
      defaultValue,
      onChange,
      className,
      ...props
    },
    ref
  ) => {
    // 辅助函数：补零
    const pad = (num: number) => num.toString().padStart(2, "0")

    function formatDate(date: Date | undefined, pickerType: string) {
      if (!date) {
        return ""
      }

      // time 模式：返回 HH:mm:ss
      if (pickerType === "time") {
        return date.toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: use12Hours,
        })
      }

      // dateTime 模式：返回 YYYY-MM-DD HH:mm:ss
      if (pickerType === "dateTime") {
        const formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
        const formattedTime = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
        return `${formattedDate} ${formattedTime}`
      }

      // week 模式
      if (pickerType === "week") {
        const startOfYear = new Date(date.getFullYear(), 0, 1)
        const week = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)
        return `${date.getFullYear()}-${week}周`
      }

      // month 模式
      if (pickerType === "month") {
        return `${date.getFullYear()}年${date.getMonth() + 1}月`
      }

      // quarter 模式
      if (pickerType === "quarter") {
        const quarter = Math.floor(date.getMonth() / 3) + 1
        return `${date.getFullYear()}年Q${quarter}`
      }

      // year 模式
      if (pickerType === "year") {
        return `${date.getFullYear()}`
      }

      // date 模式：返回 YYYY-MM-DD 格式
      const formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
      return `${formattedDate}`
    }

    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(() => {
      const initialValue = value ?? defaultValue
      return initialValue ? new Date(initialValue) : undefined
    })
    // dateTime 模式下用于临时存储正在编辑的日期时间
    const [tempDate, setTempDate] = React.useState<Date | undefined>(date)
    const [month, setMonth] = React.useState<Date | undefined>(date)
    const [inputValue, setInputValue] = React.useState(() => {
      const initialValue = value ?? defaultValue
      return initialValue ? formatDate(new Date(initialValue), picker) : ""
    })
    const inputRef = React.useRef<HTMLInputElement>(null)
    const quarterPickerRef = React.useRef<{ handleConfirm: () => void }>(null)
    const monthPickerRef = React.useRef<{ handleConfirm: () => void }>(null)

    // 当弹窗打开时，初始化 tempDate
    React.useEffect(() => {
      if (open && picker === 'dateTime') {
        setTempDate(date ? new Date(date) : new Date())
        setMonth(date ? new Date(date) : new Date())
      }
    }, [open, date, picker])

    // 处理默认值
    React.useEffect(() => {
      if (defaultValue) {
        const newDate = new Date(defaultValue)
        setDate(newDate)
        setMonth(newDate)
        setInputValue(formatDate(newDate, picker))
      }
    }, [defaultValue, picker])

    // 处理值变化
    React.useEffect(() => {
      if (value !== undefined) {
        if (value) {
          const newDate = new Date(value)
          setDate(newDate)
          setMonth(newDate)
        } else {
          setDate(undefined)
        }
        setInputValue(value ? formatDate(new Date(value), picker) : "")
      }
    }, [value, picker])

    // 自动获取焦点
    React.useEffect(() => {
      if (autoFocus && inputRef.current && !disabled) {
        inputRef.current.focus()
      }
    }, [autoFocus, disabled])

    function isValidDate(date: Date | undefined) {
      if (!date) {
        return false
      }
      return !isNaN(date.getTime())
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)

      const newDate = new Date(newValue)
      if (isValidDate(newDate)) {
        setDate(newDate)
        setMonth(newDate)
        onChange?.(newValue)
      }
    }

    const handleDateSelect = (selectedDate: Date | undefined) => {
      // dateTime 模式：只更新临时状态和月份显示
      if (picker === 'dateTime') {
        if (selectedDate) {
          setTempDate(prev => {
            if (!prev) return new Date(selectedDate)
            const newDate = new Date(prev)
            newDate.setFullYear(selectedDate.getFullYear())
            newDate.setMonth(selectedDate.getMonth())
            newDate.setDate(selectedDate.getDate())
            return newDate
          })
          setMonth(selectedDate)
        }
      } else {
        // 其他模式：直接更新值
        setDate(selectedDate)
        if (selectedDate) {
          const formatted = formatDate(selectedDate, picker)
          setInputValue(formatted)
          onChange?.(formatted)
        }
        setOpen(false)
      }
    }

    // dateTime 模式：时间变化只更新临时状态
    const handleTimeChange = React.useCallback((newDate: Date) => {      
      if (picker === 'dateTime') {
        setTempDate(newDate)
      } else {
        setDate(newDate)
        const formatted = formatDate(newDate, picker)
        setInputValue(formatted)
        onChange?.(formatted)
      }
    }, [picker, onChange])

    // dateTime 模式：点击确定按钮
    const handleConfirm = React.useCallback(() => {
      if (picker === 'quarter') {
        quarterPickerRef.current?.handleConfirm()
      } else if (picker === 'month') {
        monthPickerRef.current?.handleConfirm()
      } else if (tempDate) {
        setDate(tempDate)
        const formatted = formatDate(tempDate, picker)
        setInputValue(formatted)
        onChange?.(formatted)
      }
      setOpen(false)
    }, [picker, tempDate, onChange])

    const handleClear = () => {
      setDate(undefined)
      setInputValue("")
      onChange?.("")
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setOpen(true)
      }
    }

    // 如果是日历展开模式，直接显示日历
    if (isCalendar) {
      return (
        <div ref={ref} className={cn("w-full", className)} {...props}>
          <Calendar
            mode="single"
            selected={date}
            month={month}
            onMonthChange={setMonth}
            onSelect={handleDateSelect}
            disabled={disabled}
          />
        </div>
      )
    }

    // 渲染选择器内容
    const renderPickerContent = () => {
      // dateTime 模式使用 tempDate，其他模式使用 date
      const displayDate = picker === 'dateTime' ? tempDate : date

      switch (picker) {
        case "week":
          return (
            <WeekPicker
              date={displayDate}
              month={month}
              onSelect={handleDateSelect}
              onMonthChange={setMonth}
              disabled={disabled}
            />
          )
        case "quarter":
          return (
            <QuarterPicker
              ref={quarterPickerRef}
              date={displayDate}
              onSelect={handleDateSelect}
              disabled={disabled}
            />
          )
        case "month":
          return (
            <MonthPicker
              ref={monthPickerRef}
              date={displayDate}
              onSelect={handleDateSelect}
              disabled={disabled}
            />
          )
        case "year":
          return (
            <YearPicker
              date={displayDate}
              onSelect={handleDateSelect}
              disabled={disabled}
            />
          )
        default:
          return (
            <Calendar
              mode="single"
              selected={displayDate}
              month={month}
              onMonthChange={setMonth}
              onSelect={handleDateSelect}
              disabled={disabled}
              className="[&_.rdp-day]:h-10 [&_.rdp-day]:w-10"
            />
          )
      }
    }

    return (
      <div ref={ref} className={cn("flex w-full gap-2 flex-row", className)} {...props}>
        {
          picker == 'time' ? (
            <TimePicker
              value={date || new Date()}
              onChange={handleTimeChange}
              use12HourFormat={use12Hours}
              {...props}
            />
          ) : (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <div className="w-full">
                  <InputGroup className={cn(bordered ? "" : "border-0!", "h-10 px-3 text-sm")}>
                    <InputGroupInput
                      ref={inputRef}
                      value={inputValue}
                      placeholder={placeholder}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      disabled={disabled}
                      className={cn(bordered ? "" : "border-0!", "")}
                      {...props}
                    />
                    <InputGroupAddon align="inline-end">
                      {allowClear && inputValue && (
                        <InputGroupButton
                          variant="ghost"
                          size="icon-xs"
                          onClick={handleClear}
                          disabled={disabled}
                        >
                          <XIcon />
                        </InputGroupButton>
                      )}
                      <CalendarIcon />
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="end"
                alignOffset={-8}
                sideOffset={10}
                style={{ backgroundColor: 'rgb(30, 41, 59)', color: 'rgb(248, 250, 252)' }}
              >
                <>
                  <div className="flex">
                    {renderPickerContent()}
                    {picker == 'dateTime' ? (
                      <>
                        <div className="w-full border-t pt-4">
                          <TimePicker
                            value={tempDate || new Date()}
                            onChange={handleTimeChange}
                            use12HourFormat={use12Hours}
                            inline={true}
                            {...props}
                          />
                        </div>

                      </>
                    ) : null}
                  </div>
                  <div className="flex justify-end pb-2 px-2">
                    <Button
                      size="sm"
                      onClick={handleConfirm}
                    >
                      确定
                    </Button>
                  </div>
                </>
              </PopoverContent>
            </Popover>
          )
        }
      </div>
    )
  }
)
FormDate.displayName = "FormDate"

export { FormDate }