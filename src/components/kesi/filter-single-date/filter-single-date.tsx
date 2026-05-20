import React, { useState } from 'react'
import dayjs from 'dayjs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { CalendarIcon, XIcon } from 'lucide-react'

interface FilterSingleDateProps {
  value?: any
  onChange?: (value: any) => void
  schema?: {
    format?: string
    format2?: string
  }
  filterFormat?: string
}

type DateFormat = 'ym' | 'date' | 'datetime' | 'date-time' | 'ymdh'

// 日期格式映射
const FORMAT_PARAMS: Record<string, 'month' | 'date' | 'hour'> = {
  'ym': 'month',
  'date': 'date',
  'datetime': 'date',
  'date-time': 'date',
  'ymdh': 'hour'
}

// 日期显示格式
const DISPLAY_FORMATS: Record<string, string> = {
  'ym': 'YYYY年MM月',
  'date': 'YYYY-MM-DD',
  'datetime': 'YYYY-MM-DD HH:mm:ss',
  'date-time': 'YYYY-MM-DD HH:mm:ss',
  'ymdh': 'YYYY-MM-DD HH'
}

// 辅助函数：补零
const pad = (num: number) => num.toString().padStart(2, '0')

// 格式化日期
const formatDate = (date: Date, format: string): string => {
  const d = dayjs(date)

  if (format === 'ym') {
    return d.format('YYYY年MM月')
  }
  if (format === 'datetime' || format === 'date-time') {
    return d.format('YYYY-MM-DD HH:mm:ss')
  }
  if (format === 'ymdh') {
    return d.format('YYYY-MM-DD HH')
  }
  return d.format('YYYY-MM-DD')
}

// 获取日期范围
const getDateRange = (date: Date, format: string) => {
  const start = dayjs(date)

  if (!start.isValid()) {
    throw new Error('无效的日期格式')
  }

  const param = FORMAT_PARAMS[format]

  // 获取起始时间
  const startOfPeriod = start.startOf(param).format('YYYY-MM-DD HH:mm:ss')

  // 获取结束时间
  const endOfPeriod = start.endOf(param).format('YYYY-MM-DD HH:mm:ss')

  return { gte: startOfPeriod, lte: endOfPeriod }
}

const FilterSingleDate: React.FC<FilterSingleDateProps> = ({ value, onChange, schema, ...props }) => {
  const [open, setOpen] = useState(false)

  const filterFormat = (props.filterFormat || schema?.format2 || schema?.format) as DateFormat || 'date'
  const displayFormat = DISPLAY_FORMATS[filterFormat] || 'YYYY-MM-DD'

  // 解析当前值
  const parseValue = () => {
    if (filterFormat === 'datetime' || filterFormat === 'date-time') {
      // 精确日期时间模式
      if (value && typeof value === 'string') {
        const parsed = dayjs(value, 'YYYY-MM-DD HH:mm:ss')
        return parsed.isValid() ? parsed.toDate() : undefined
      }
      return undefined
    } else {
      // 范围模式，取 gte 值
      if (value?.gte && typeof value.gte === 'string') {
        const parsed = dayjs(value.gte, 'YYYY-MM-DD HH:mm:ss')
        return parsed.isValid() ? parsed.toDate() : undefined
      }
      return undefined
    }
  }

  const currentDate = parseValue()

  // 格式化显示值
  const inputValue = currentDate ? formatDate(currentDate, filterFormat) : ''

  // 处理日期选择
  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange?.(null)
      setOpen(false)
      return
    }

    if (filterFormat === 'datetime' || filterFormat === 'date-time') {
      // 精确日期时间模式
      onChange?.(dayjs(selectedDate).format('YYYY-MM-DD HH:mm:ss'))
      setOpen(false)
    } else {
      // 范围模式
      const range = getDateRange(selectedDate, filterFormat)
      onChange?.(range)
      setOpen(false)
    }
  }

  // 清空选择
  const handleClear = () => {
    onChange?.(null)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="w-full">
          <InputGroup className="h-10">
            <InputGroupInput
              value={inputValue}
              placeholder={`请选择日期${filterFormat === 'ym' ? '(年月)' : filterFormat === 'datetime' || filterFormat === 'date-time' ? '(时间)' : ''}`}
              readOnly
              className="cursor-pointer"
            />
            <InputGroupAddon align="inline-end">
              {inputValue && (
                <InputGroupButton
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleClear}
                >
                  <XIcon className="h-3 w-3" />
                </InputGroupButton>
              )}
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden p-0"
        align="end"
        alignOffset={-8}
        sideOffset={10}
      >
        <div className="p-2">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={handleSelect}
            initialFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

FilterSingleDate.displayName = "FilterSingleDate"

export { FilterSingleDate }
