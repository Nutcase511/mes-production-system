import React from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useModelPagination, useModelPageSize, useModelCount, useModelList } from '@airiot/client'

interface ViewPaginationProps {
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean
  pageSizeOptions?: number[]
  className?: string
  disabled?: boolean
}

const ViewPagination: React.FC<ViewPaginationProps> = ({
  showSizeChanger = false,
  showQuickJumper = true,
  showTotal = false,
  className = '',
  disabled = false
}) => {
  const { items: pageItems, activePage, changePage } = useModelPagination()
  const { sizes, setPageSize, size } = useModelPageSize()
  const { count: apiCount } = useModelCount()
  const { items: listItems } = useModelList()

  // 优先使用 API 返回的 count（需要后端 withCount 支持）
  // 否则用当前页数据条数兜底
  const totalCount = apiCount > 0 ? apiCount : listItems?.length || 0
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / size) : (pageItems || 1)

  // 判断当前页是否是"满页"（说明可能有下一页）
  const currentItemCount = listItems?.length || 0
  const hasMorePages = currentItemCount >= size

  // 无数据时不显示
  if (totalCount === 0 && currentItemCount === 0) {
    return null
  }

  // 只有一页且不满一页时，不需要分页
  if (totalPages <= 1 && !hasMorePages) {
    return null
  }

  // 即使 totalPages=1，如果当前页满了说明可能有更多数据，仍然显示分页
  const effectiveTotalPages = hasMorePages && totalPages <= 1 ? activePage + 1 : totalPages

  const handlePageChange = (page: number) => {
    if (!disabled) {
      changePage(page)
    }
  }

  const handlePageSizeChange = (newPageSize: number) => {
    if (!disabled) {
      setPageSize(newPageSize)
    }
  }

  // 生成页码
  const getPageNumbers = () => {
    const maxButtons = 7
    const pages: (number | 'ellipsis')[] = []

    if (effectiveTotalPages <= maxButtons) {
      for (let i = 1; i <= effectiveTotalPages; i++) {
        pages.push(i)
      }
    } else {
      if (activePage <= Math.ceil(maxButtons / 2)) {
        for (let i = 1; i <= maxButtons - 2; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(effectiveTotalPages)
      } else if (activePage >= effectiveTotalPages - Math.floor(maxButtons / 2)) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = effectiveTotalPages - (maxButtons - 2); i <= effectiveTotalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('ellipsis')
        const start = activePage - Math.floor((maxButtons - 4) / 2)
        for (let i = start; i < start + maxButtons - 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(effectiveTotalPages)
      }
    }

    return pages
  }

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {/* 显示总数 */}
      {showTotal && (
        <div className="text-sm text-blue-300/70">
          共 {totalCount > 0 ? totalCount : `${currentItemCount}+`} 条
        </div>
      )}

      {/* 分页器 */}
      <div className="flex items-center gap-2">
        <Pagination className="gap-1">
          <PaginationContent>
            {/* 上一页 */}
            <PaginationLink
              aria-label="Go to previous page"
              size="default"
              onClick={() => activePage > 1 && handlePageChange(activePage - 1)}
              aria-disabled={disabled || activePage === 1}
              className={`gap-1 pl-2.5 ${disabled || activePage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>上一页</span>
            </PaginationLink>

            {/* 页码 */}
            {getPageNumbers().map((page, index) => {
              if (page === 'ellipsis') {
                return <PaginationEllipsis key={`ellipsis-${index}`} />
              }

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={page === activePage}
                    onClick={() => handlePageChange(page as number)}
                    className="cursor-pointer" size={undefined}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            {/* 下一页 */}
            <PaginationLink
              aria-label="Go to next page"
              size="default"
              onClick={() => activePage < effectiveTotalPages && handlePageChange(activePage + 1)}
              aria-disabled={disabled || activePage === effectiveTotalPages}
              className={`gap-1 pr-2.5 ${disabled || activePage === effectiveTotalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
            >
              <span>下一页</span>
              <ChevronRight className="h-4 w-4" />
            </PaginationLink>

          </PaginationContent>
        </Pagination>
      </div>

      {/* 每页条数选择器 */}
      {showSizeChanger && (
        <div className="flex items-center gap-2">
          <Select
            value={size.toString()}
            onValueChange={(value) => handlePageSizeChange(Number(value))}
            disabled={disabled}
          >
            <SelectTrigger className="w-25">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size} 条/页
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 快速跳转 */}
      {showQuickJumper && effectiveTotalPages > 5 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-blue-300/70">跳至</span>
          <input
            type="number"
            min={1}
            max={effectiveTotalPages}
            className="w-16 px-2 py-1 border border-blue-400/30 rounded-md text-center bg-blue-500/10 text-white disabled:opacity-50"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const page = parseInt(e.currentTarget.value)
                if (page >= 1 && page <= effectiveTotalPages) {
                  handlePageChange(page)
                }
              }
            }}
          />
          <span className="text-blue-300/70">页</span>
        </div>
      )}
    </div>
  )
}

export { ViewPagination }
export default ViewPagination
