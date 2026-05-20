import React, { useState } from 'react'
import dayjs from 'dayjs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { CalendarIcon, XIcon } from 'lucide-react'
import { TimePicker } from '@/components/ui/time-picker'

interface FilterDatetimeProps {
  value?: any
  onChange?: (value: any) => void
  datetimeFormat?: string
}

const FilterDatetime: React.FC<FilterDatetimeProps> = ({ value, onChange, datetimeFormat }) => {

  const startValueStr = value?.gte
  const endValueStr = value?.lte

  // 解析日期值
  const parseDate = (dateStr: string | undefined) => {
    if (!dateStr) return undefined
    const parsed = dayjs(dateStr, 'YYYY-MM-DD HH:mm:ss')
    return parsed.isValid() ? parsed.toDate() : undefined
  }

  const startDate = parseDate(startValueStr)
  const endDate = parseDate(endValueStr)

  // 开始日期选择器状态
  const [startOpen, setStartOpen] = useState(false)
  const [startTempDate, setStartTempDate] = useState<Date | undefined>(startDate)

  // 结束日期选择器状态
  const [endOpen, setEndOpen] = useState(false)
  const [endTempDate, setEndTempDate] = useState<Date | undefined>(endDate)

  // 开始日期变化处理
  const handleStartDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setStartTempDate(prev => {
        if (!prev) return new Date(selectedDate)
        const newDate = new Date(prev)
        newDate.setFullYear(selectedDate.getFullYear())
        newDate.setMonth(selectedDate.getMonth())
        newDate.setDate(selectedDate.getDate())
        return newDate
      })
    }
  }

  const handleStartTimeChange = (newDate: Date) => {
    setStartTempDate(newDate)
  }

  const handleStartConfirm = () => {
    if (startTempDate) {
      const formatted = dayjs(startTempDate).format('YYYY-MM-DD HH:mm:ss')
      onChange?.({
        ...value,
        gte: formatted,
        rule: 'range'
      })
    }
    setStartOpen(false)
  }

  const handleStartClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.({
      ...value,
      gte: null,
      rule: 'range'
    })
  }

  // 结束日期变化处理
  const handleEndDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setEndTempDate(prev => {
        if (!prev) return new Date(selectedDate)
        const newDate = new Date(prev)
        newDate.setFullYear(selectedDate.getFullYear())
        newDate.setMonth(selectedDate.getMonth())
        newDate.setDate(selectedDate.getDate())
        return newDate
      })
    }
  }

  const handleEndTimeChange = (newDate: Date) => {
    setEndTempDate(newDate)
  }

  const handleEndConfirm = () => {
    if (endTempDate) {
      const formatted = dayjs(endTempDate).format('YYYY-MM-DD HH:mm:ss')
      onChange?.({
        ...value,
        lte: formatted,
        rule: 'range'
      })
    }
    setEndOpen(false)
  }

  const handleEndClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.({
      ...value,
      lte: null,
      rule: 'range'
    })
  }

  // 打开弹窗时初始化临时日期
  const handleStartOpenChange = (open: boolean) => {
    if (open) {
      setStartTempDate(startDate || new Date())
    }
    setStartOpen(open)
  }

  const handleEndOpenChange = (open: boolean) => {
    if (open) {
      setEndTempDate(endDate || new Date())
    }
    setEndOpen(open)
  }

  // 格式化显示值
  const formatDisplayValue = (date: Date | undefined) => {
    return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : ''
  }

  // 开始日期的禁用判断：禁用结束日期之后的日期（只比较日期部分）
  const isStartDateDisabled = (date: Date) => {
    if (!endDate) return false
    return dayjs(date).startOf('day').isAfter(dayjs(endDate).startOf('day'))
  }

  // 结束日期的禁用判断：禁用开始日期之前的日期（只比较日期部分）
  const isEndDateDisabled = (date: Date) => {
    if (!startDate) return false
    return dayjs(date).startOf('day').isBefore(dayjs(startDate).startOf('day'))
  }

  return (
    <div className="flex items-center gap-2">
      {/* 开始日期时间选择器 */}
      <div className="flex-1">
        <Popover open={startOpen} onOpenChange={handleStartOpenChange}>
          <PopoverTrigger asChild>
            <div className="w-full">
              <InputGroup className="h-10">
                <InputGroupInput
                  value={formatDisplayValue(startDate)}
                  placeholder="起始时间"
                  readOnly
                  className="cursor-pointer"
                />
                <InputGroupAddon align="inline-end">
                  {startDate && (
                    <InputGroupButton
                      variant="ghost"
                      size="icon-xs"
                      onClick={handleStartClear}
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
            <div className="flex">
              <Calendar
                mode="single"
                selected={startTempDate}
                onSelect={handleStartDateSelect}
                disabled={isStartDateDisabled}
              />
              <div className="w-full border-t pt-4">
                <TimePicker
                  value={startTempDate || new Date()}
                  onChange={handleStartTimeChange}
                  inline={true}
                />
              </div>
            </div>
            <div className="flex justify-end pb-2 px-2">
              <Button size="sm" onClick={handleStartConfirm}>
                确定
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <span className="text-muted-foreground">到</span>

      {/* 结束日期时间选择器 */}
      <div className="flex-1">
        <Popover open={endOpen} onOpenChange={handleEndOpenChange}>
          <PopoverTrigger asChild>
            <div className="w-full">
              <InputGroup className="h-10">
                <InputGroupInput
                  value={formatDisplayValue(endDate)}
                  placeholder="结束时间"
                  readOnly
                  className="cursor-pointer"
                />
                <InputGroupAddon align="inline-end">
                  {endDate && (
                    <InputGroupButton
                      variant="ghost"
                      size="icon-xs"
                      onClick={handleEndClear}
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
            <div className="flex">
              <Calendar
                mode="single"
                selected={endTempDate}
                onSelect={handleEndDateSelect}
                disabled={isEndDateDisabled}
              />
              <div className="w-full border-t pt-4">
                <TimePicker
                  value={endTempDate || new Date()}
                  onChange={handleEndTimeChange}
                  inline={true}
                />
              </div>
            </div>
            <div className="flex justify-end pb-2 px-2">
              <Button size="sm" onClick={handleEndConfirm}>
                确定
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

FilterDatetime.displayName = "FilterDatetime"

export { FilterDatetime }
