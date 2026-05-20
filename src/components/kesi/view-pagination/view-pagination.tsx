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
import { useModelPagination, useModelPageSize, useModelCount } from '@airiot/client'

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
  const { items, activePage, changePage } = useModelPagination()
  const { sizes, setPageSize, size } = useModelPageSize()
  const { count } = useModelCount()

  const totalPages = count > 0 ? Math.ceil(count / size) : Math.ceil(items) || 1

  // 不显示分页的情况
  if (totalPages <= 1) {
    return null
  }

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

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (activePage <= Math.ceil(maxButtons / 2)) {
        // 靠近开始
        for (let i = 1; i <= maxButtons - 2; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (activePage >= totalPages - Math.floor(maxButtons / 2)) {
        // 靠近结束
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - (maxButtons - 2); i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // 在中间
        pages.push(1)
        pages.push('ellipsis')
        const start = activePage - Math.floor((maxButtons - 4) / 2)
        for (let i = start; i < start + maxButtons - 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {/* 显示总数 */}
      {showTotal && (
        <div className="text-sm text-slate-600">
          共 {count} 条
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
                    className="cursor-pointer" size={undefined}                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            {/* 下一页 */}
            <PaginationLink
              aria-label="Go to next page"
              size="default"
              onClick={() => activePage < totalPages && handlePageChange(activePage + 1)}
              aria-disabled={disabled || activePage === totalPages}
              className={`gap-1 pr-2.5 ${disabled || activePage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
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
      {showQuickJumper && totalPages > 5 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-600">跳至</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            className="w-16 px-2 py-1 border border-slate-300 rounded-md text-center disabled:opacity-50"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const page = parseInt(e.currentTarget.value)
                if (page >= 1 && page <= totalPages) {
                  handlePageChange(page)
                }
              }
            }}
          />
          <span className="text-slate-600">页</span>
        </div>
      )}
    </div>
  )
}

export { ViewPagination }
export default ViewPagination
