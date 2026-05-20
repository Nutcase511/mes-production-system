import * as React from 'react'
import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Loader2, X, ChevronDown } from 'lucide-react'
import { createAPI } from '@airiot/client'
import type { RelateFieldOption } from '@/lib/form-relate-types'
import { cn } from '@/lib/utils'

interface AsyncSelectProps {
  field?: {
    schema?: Record<string, any>
    filter?: any
    meta?: any
    key?: string
    displayField?: string
    tableID?: string
    relateShowFields?: Array<{
      key: string
      title: string
      mapToCurrent?: boolean
      mapField?: string
      fieldSchema?: any
    }>
    option?: {
      form?: {
        change: (field: string, value: any) => void
      }
    }
  }
  schema?: Record<string, any> | {
    relateSchema: Record<string, any>
    relateTo?: string
    relate?: {
      id?: string
      fields?: Array<{
        key: string
        title: string
        fieldSchema?: any
      }>
    }
    relateShowFields?: any
  }
  meta?: any
  record?: any
  antdForm?: any
  label?: string
  disabled?: boolean
  value?: RelateFieldOption | null | RelateFieldOption[]
  mode?: 'multiple' | 'single'
  isOptionSelected?: (option: RelateFieldOption) => boolean
  style?: React.CSSProperties
  onChange?: (value: any) => void
  /**
   * 外部传入的过滤器对象
   * 组件变为纯组件后，由父组件负责构建 filterObj
   */
  filterObj?: Record<string, any>
}

/**
 * AsyncSelect - 异步选择器组件
 * 支持搜索、分页加载、精确搜索
 */
const AsyncSelect: React.FC<AsyncSelectProps> = (props) => {
  const {
    schema = {},
    label = '请选择',
    disabled = false,
    mode,
    value: propValue,
    onChange,
    style,
    filterObj = {},
  } = props

  const relateSchema = (schema?.relate || schema?.relateTo) ? schema : schema?.relateSchema

  const { relateShowFields } = relateSchema || {}
  const displayField = relateSchema?.relate?.fields?.[0]?.key || 'name'

  // 状态管理
  const [loading, setLoading] = React.useState(false)
  const [pageLoading, setPageLoading] = React.useState(false)
  const [allOptions, setAllOptions] = React.useState<RelateFieldOption[]>([])
  const [filteredOptions, setFilteredOptions] = React.useState<RelateFieldOption[]>([])
  const [page, setPage] = React.useState(0)
  const [hasMore, setHasMore] = React.useState(true)
  const [open, setOpen] = React.useState(false)
  const [inputSearchValue, setInputSearchValue] = React.useState('')
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1)

  const itemsRef = React.useRef<RelateFieldOption[]>([])
  const currentPageRef = React.useRef(0)
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // 获取选项数据（不根据搜索词过滤，加载所有数据）
  const loadOptions = React.useCallback(
    async (pageNum: number = 0): Promise<number> => {
      if (currentPageRef.current >= pageNum && pageNum !== 0) {
        return 0
      }
      if (pageNum === 0) {
        itemsRef.current = []
        currentPageRef.current = 0
        setAllOptions([])
      }
      currentPageRef.current = pageNum

      setLoading(true)
      try {
        const s = relateSchema
        const resource = s?.relateTo ? `core/${s.relateTo.toLowerCase()}` : s?.name ? s?.name : `core/t/${s?.relate?.id}/d`

        // 创建 API 实例
        const api = createAPI({ resource })

        // 使用 api.query 查询数据
        const relateFieldKeys = relateShowFields?.map((f: { key: string }) => f.key) || []
        const { items } = await api.query(
          {
            limit: 100,
            skip: pageNum * 100,
            fields: ['id', displayField, ...relateFieldKeys].filter(Boolean)
          },
          filterObj
        )

        const newOptions = items.map((item: any) => ({
          value: item.id,
          label: item[displayField] || item.name || item.id,
          key: item.id,
          item,
        }))

        itemsRef.current = [...itemsRef.current, ...newOptions]

        setAllOptions((prev) => {
          // 使用 Map 去重（按 value/id 去重）
          const optionMap = new Map<string, RelateFieldOption>()
          // 先添加已有的选项
          prev.forEach((opt: RelateFieldOption) => optionMap.set(opt.key, opt))
          // 再添加新选项（会覆盖重复的）
          newOptions.forEach((opt: RelateFieldOption) => optionMap.set(opt.key, opt))
          return Array.from(optionMap.values())
        })
        setHasMore(items.length === 100)

        return items.length || 0
      } catch (error) {
        return 0
      } finally {
        setLoading(false)
      }
    },
    [displayField, schema, relateShowFields, JSON.stringify(filterObj)]
  )

  // 前端过滤选项
  React.useEffect(() => {
    if (!inputSearchValue) {
      setFilteredOptions(allOptions)
    } else {
      const searchLower = inputSearchValue.toLowerCase()
      const filtered = allOptions.filter((option) =>
        option.label?.toLowerCase().includes(searchLower)
      )
      setFilteredOptions(filtered)
    }
    setHighlightedIndex(-1)
  }, [inputSearchValue, allOptions])

  // 初始加载
  React.useEffect(() => {
    loadOptions()
  }, [loadOptions])

  // 处理选项选择
  const handleSelectOption = (option: RelateFieldOption, e?: React.MouseEvent) => {
    // 阻止事件冒泡，防止点击选项时Popover关闭
    e?.stopPropagation()

    if (mode === 'multiple') {
      // 如果propValue不是数组，初始化为空数组
      const currentSelected = isArray(propValue) ? propValue : []

      const isSelected = currentSelected.some((v: any) => v?.key === option.value || v?.value === option.value)
      let newSelected: RelateFieldOption[]
      if (isSelected) {
        newSelected = currentSelected.filter((v: any) => v?.key !== option.value && v?.value !== option.value)
      } else {
        newSelected = [...currentSelected, option]
      }
      onChange?.(newSelected)
    } else {
      onChange?.(option)
      setOpen(false)
      setInputSearchValue('')
    }
  }

  // 处理清除
  const handleClear = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation()
    if (mode === 'multiple') {
      onChange?.([])
    } else {
      onChange?.({})
    }
    setInputSearchValue('')
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev: number) => {
        const next = prev + 1
        return next < filteredOptions.length ? next : prev
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev: number) => {
        const next = prev - 1
        return next >= 0 ? next : 0
      })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelectOption(filteredOptions[highlightedIndex])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  // 加载更多
  const loadMore = React.useCallback(async () => {
    if (pageLoading || !hasMore) return

    const nextPage = page + 1
    setPage(nextPage)
    setPageLoading(true)

    await loadOptions(nextPage)
    setPageLoading(false)
  }, [page, pageLoading, hasMore, loadOptions])

  // 格式化显示值
  const formatDisplayValue = (val: any): string => {
    if (isObject(val) && 'label' in val && typeof val.label === 'string') {
      return val.label
    } else if (isObject(val) && 'key' in val) {
      return allOptions.find((opt) => opt.value === val.key)?.item?.[displayField] || val.key
    } else {
      return '空'
    }
  }

  const currentValue: any =
    mode === 'multiple'
      ? (isArray(propValue) ? propValue.map((v) => (v as any)?.key || v).filter(Boolean) : [])
      : (propValue as any)?.key || ''

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: 150, ...style }}>
      <Popover open={open} onOpenChange={(newOpen: boolean) => {
        setOpen(newOpen)
        if (newOpen) {
          setTimeout(() => searchInputRef.current?.focus(), 0)
        } else {
          setInputSearchValue('')
        }
      }}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              'flex items-center justify-between w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            onClick={() => !disabled && setOpen(true)}
          >
            <span className={cn('flex-1 truncate', !propValue && 'text-muted-foreground')}>
              {mode === 'multiple' && isArray(propValue) && propValue.length > 0
                ? propValue.map((v) => formatDisplayValue(v)).join(', ')
                : mode === 'multiple' ? '' : formatDisplayValue(propValue)}
            </span>
            <div className="flex items-center gap-1">
              {(mode === 'multiple' && isArray(propValue) && propValue.length > 0) && !disabled && (
                <X
                  className="h-4 w-4 text-muted-foreground hover:text-foreground"
                  onClick={handleClear}
                />
              )}
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-full min-w-[200px]"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="p-2">
            {/* 搜索输入框 */}
            <input
              ref={searchInputRef}
              type="text"
              value={inputSearchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索..."
              className={cn(
                'w-full h-9 px-3 py-1 text-sm bg-background border border-input rounded-md',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'placeholder:text-muted-foreground'
              )}
            />

            {/* 选项列表 */}
            <div
              ref={dropdownRef}
              className="mt-1 max-h-60 overflow-y-scroll"
              onWheel={(e) => e.stopPropagation()}
            >
              {loading && filteredOptions.length === 0 ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm">加载中...</span>
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {inputSearchValue ? '未找到匹配项' : '暂无数据'}
                </div>
              ) : (
                <>
                  {filteredOptions.map((option: RelateFieldOption, index: number) => {
                    const isSelected = mode === 'multiple'
                      ? isArray(propValue) && propValue.some((v: any) => v?.key === option.value || v?.value === option.value)
                      : (propValue as any)?.key === option.value
                    return (
                      <div
                        key={option.value}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm cursor-pointer rounded-md',
                          'hover:bg-accent hover:text-accent-foreground',
                          highlightedIndex === index && 'bg-accent',
                          isSelected && 'bg-accent text-accent-foreground'
                        )}
                        onClick={(e) => handleSelectOption(option, e)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      >
                        {mode === 'multiple' && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="mr-2"
                          />
                        )}
                        <span className="truncate">{option.label}</span>
                      </div>
                    )
                  })}
                  {loading && page > 0 && (
                    <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      加载中...
                    </div>
                  )}
                  {!loading && !hasMore && page > 0 && (
                    <div className="text-center p-2 text-sm text-muted-foreground">
                      已加载全部
                    </div>
                  )}
                  {hasMore && !loading && (
                    <div className="text-center p-2">
                      <Button variant="ghost" size="sm" onClick={loadMore} disabled={pageLoading} className="w-full">
                        {pageLoading ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            加载中...
                          </>
                        ) : (
                          '加载更多'
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { AsyncSelect }
