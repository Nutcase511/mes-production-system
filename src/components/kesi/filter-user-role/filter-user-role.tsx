import { useState, useEffect, useCallback, useRef } from 'react'
import unionWith from 'lodash/unionWith'
import isEqual from 'lodash/isEqual'
import { createAPI, useModel } from '@airiot/client'
import { ChevronDown, Check, X, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface FilterUserRoleProps {
  key?: string
  displayField?: string
  showField?: string
  schema?: { name?: string, resource?: string }
  relateSchema?: {
    selectType?: string
    ignoreAdmin?: boolean
    size?: string
  }
  value?: any
  onChange: (value: any) => void
  name?: string
  label?: string
  [key: string]: any
}

interface UserOption {
  value: string
  label: string
  item?: any
}

const FilterUserRole: React.FC<FilterUserRoleProps> = (props) => {
  const {
    key,
    displayField = 'name',
    showField,
    schema,
    relateSchema,
    value,
    onChange,
    name,
    label
  } = props
  const { model } = useModel()

  const [options, setOptions] = useState<UserOption[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [allOptions, setAllOptions] = useState<UserOption[]>([])

  const searchRef = useRef<string>('')
  const itemsRef = useRef<UserOption[]>([])

  const ignoreAdmin = relateSchema?.ignoreAdmin

  // 初始化选中的值
  const getSelectedValues = useCallback(() => {
    if (!value) return []
    // $or 模式 (多选 OR)
    if (value.$or) {
      return value.$or.map((v: any) => v[name || '']?.$regex || v[name || '']).filter(Boolean)
    }
    // $in 模式 (单选或多选 IN)
    if (value.$in) return value.$in
    return []
  }, [value, name])

  const selectedValues = getSelectedValues()

  // 加载选项数据
  const loadOptions = useCallback(async (searchValue = '', pageNum = 0) => {
    if (!model) return

    // 如果是第一页，重置缓存
    if (pageNum === 0) {
      itemsRef.current = []
      setHasMore(true)
    }

    setLoading(true)

    const fields = showField ? ['id', displayField, showField] : ['id', displayField]

    // 构建查询条件
    let filterObj: any = {}
    if (searchValue) {
      filterObj = { search: { [displayField]: { like: searchValue } } }
    } else {
      filterObj = { search: {} }
    }

    // 处理 users -> usersId 的特殊情况
    if (filterObj.search?.users) {
      filterObj.search.usersId = filterObj.search.users
      delete filterObj.search.users
    }

    const api = createAPI({
      resource: schema?.resource || `core/${schema?.name}`,
      name: 'filter-user-role'
    })

    try {
      const { items } = await api.query(
        { limit: 50, skip: pageNum * 50, fields },
        filterObj
      )

      const newOptions = items
        .filter(item => !(ignoreAdmin && item.id === 'admin'))
        .map(item => ({
          value: item.id,
          label: item[displayField],
          item
        }))

      itemsRef.current = [...itemsRef.current, ...newOptions]
      setOptions(itemsRef.current)
      setAllOptions(prev => unionWith(prev, itemsRef.current, isEqual))

      // 如果返回少于50条，说明没有更多数据了
      setHasMore(items.length >= 50)

      return items.length
    } catch (err) {
      return 0
    } finally {
      setLoading(false)
    }
  }, [model, displayField, showField, ignoreAdmin, schema?.name, relateSchema])

  // 初始加载
  useEffect(() => {
    loadOptions()
  }, [])

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== searchRef.current) {
        searchRef.current = search
        setPage(0)
        loadOptions(search, 0)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [search, loadOptions])

  // 分页加载
  useEffect(() => {
    if (page > 0) {
      loadOptions(searchRef.current, page)
    }
  }, [page, loadOptions])

  // 滚动加载更多
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const { scrollTop, scrollHeight, clientHeight } = target

    // 距离底部还有50px时触发加载
    if (scrollHeight - scrollTop - clientHeight < 50 && hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }

  // 处理单个选项的点击（多选模式：切换选中状态）
  const handleToggle = (optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((v: string) => v !== optionValue)
      : [...selectedValues, optionValue]

    handleChange(newValues)
  }

  // 处理值变化（多选 OR 模式）
  const handleChange = useCallback((values: string[]) => {
    if (!values || values.length === 0) {
      onChange(null)
      return
    }

    onChange({
      $or: values.map(id => ({
        [name || key || 'user']: { $regex: id }
      }))
    })
  }, [name, key, onChange])

  // 清空选择
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(undefined)
  }

  // 获取选中的标签
  const getSelectedLabels = () => {
    return allOptions
      .filter(o => selectedValues.includes(o.value))
      .map(o => o.label)
  }

  const selectedLabels = getSelectedLabels()

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
            {selectedLabels.length > 0 ? (
              selectedValues.map((val: string, index: number) => {
                const label = selectedLabels[index]
                return (
                  <Badge key={val} variant="secondary" className="gap-1 text-xs pl-1 pr-1 py-0">
                    {label}
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
              <span className="text-muted-foreground">{label || '请选择用户'}</span>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2 shrink-0">
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
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="relative">
          {/* 搜索框 */}
          <div className="flex items-center border-b px-3">
            <input
              type="text"
              placeholder="搜索用户..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
          </div>

          {/* 选项列表 */}
          <div
            className="max-h-75 overflow-y-auto"
            onScroll={handleScroll}
          >
            {options.length === 0 && !loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                暂无数据
              </div>
            ) : (
              options.map(option => {
                const isSelected = selectedValues.includes(option.value)
                return (
                  <div
                    key={option.value}
                    className={cn(
                      'relative flex cursor-pointer select-none items-center px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                      isSelected && 'bg-accent'
                    )}
                    onClick={() => handleToggle(option.value)}
                  >
                    <span className="flex-1">{option.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-primary ml-2" />}
                  </div>
                )
              })
            )}

            {/* 加载更多提示 */}
            {loading && page > 0 && (
              <div className="py-2 text-center text-sm text-muted-foreground">
                <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                加载中...
              </div>
            )}
            {!loading && !hasMore && options.length > 0 && (
              <div className="py-2 text-center text-xs text-muted-foreground">
                已加载全部
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

FilterUserRole.displayName = 'FilterUserRole'

export { FilterUserRole }
