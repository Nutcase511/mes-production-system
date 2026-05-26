import { DataGrid, DataGridContainer } from '@/components/reui/data-grid/data-grid'
import { DataGridTable } from '@/components/reui/data-grid/data-grid-table'
import { DataGridPagination } from '@/components/reui/data-grid/data-grid-pagination'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { LoadingDots } from '@/components/ui/loading-dots'
import {
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { formatDate, formatDateTime } from '@/lib/utils'
import type { TableSchema } from '@/services/production.service'

interface ProductionTableBlockProps {
  data: any[]
  loading?: boolean
  schema?: TableSchema
  onRowClick?: (row: any) => void
  onDetailOrder?: (row: any) => void
  onEditOrder?: (row: any) => void
  pagination?: {
    current: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (pageSize: number) => void
  }
}

// 订单类型映射
const orderTypeMap: Record<string, string> = {
  batch: '批产',
  develop: '研制',
  rework: '返修'
}

// 获取枚举字段的显示值
const getEnumDisplayValue = (fieldSchema: any, value: any) => {
  if (!value || !fieldSchema) return value

  const enumValues = fieldSchema.enum1
  const enumTitles = fieldSchema.enum_title1

  if (!enumValues || !Array.isArray(enumValues)) return value

  const index = enumValues.indexOf(value)
  if (index !== -1 && enumTitles && Array.isArray(enumTitles) && enumTitles[index]) {
    return enumTitles[index]
  }

  return value
}

// 根据字段类型渲染单元格内容
const renderCellValue = (fieldKey: string, value: any, fieldSchema?: any) => {
  if (value === null || value === undefined) {
    return <span className="text-blue-200/50">-</span>
  }

  // 处理枚举字段（优先使用 enum_title1 对应的显示值）
  if (fieldSchema?.enum1) {
    return <span>{getEnumDisplayValue(fieldSchema, value)}</span>
  }

  // 处理日期类型
  if (fieldSchema?.format === 'date' || fieldKey.startsWith('date-')) {
    return formatDate(value)
  }

  // 处理数字类型
  if (fieldSchema?.type === 'number' || fieldKey.startsWith('number-')) {
    return <span className="text-right">{value}</span>
  }

  // 自动检测字符串类型的时间字段
  if (typeof value === 'string' && isDateString(value)) {
    // 如果包含时间部分，使用完整日期时间格式
    if (value.includes('T') || value.includes(':')) {
      return <span>{formatDateTime(value)}</span>
    } else {
      return <span>{formatDate(value)}</span>
    }
  }

  // 处理关联字段（User 对象或其他对象）
  if (typeof value === 'object') {
    // User 对象显示 name
    if (value.name) {
      return value.name
    }
    // 其他对象尝试显示 id
    if (value.id) {
      return value.id
    }
    // 空对象
    return <span className="text-blue-200/50">-</span>
  }

  // 默认返回字符串
  return String(value)
}

/**
 * 检测字符串是否为日期格式
 */
function isDateString(value: string): boolean {
  if (!value || typeof value !== 'string') return false

  // ISO 8601 格式：2024-01-01 或 2024-01-01T00:00:00
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/
  return isoDateRegex.test(value)
}

export function ProductionTableBlock({
  data,
  loading,
  schema,
  onRowClick,
  onDetailOrder,
  onEditOrder,
  pagination
}: ProductionTableBlockProps) {
  // 根据schema动态生成列定义
  const columns: ColumnDef<any>[] = []

  // 如果有schema，根据schema.form的顺序生成列
  if (schema?.schema?.form && schema.schema.properties) {
    // 定义要显示的列（排除一些不需要在列表中显示的字段）
    const excludedFields = ['upload-single-AE62', 'text-F185', 'auditByOpinion']

    schema.schema.form.forEach((fieldKey: string) => {
      // 跳过排除的字段
      if (excludedFields.includes(fieldKey)) {
        return
      }

      const fieldSchema = schema.schema?.properties?.[fieldKey]
      if (!fieldSchema) {
        return
      }

      // 表格中显示所有字段，包括 readonly 字段（readonly 只影响表单编辑，不影响列表显示）
      // 但仍然排除内部字段（以 _ 开头）
      if (fieldKey.startsWith('_')) {
        return
      }

      // 根据字段类型设置列宽
      let columnSize = 150 // 默认宽度
      if (fieldSchema.format === 'date' || fieldKey.startsWith('date-')) {
        columnSize = 200
      } else if (fieldSchema.type === 'number' || fieldKey.startsWith('number-')) {
        columnSize = 100
      } else if (fieldSchema.enum1) {
        columnSize = 100
      } else if (fieldKey.startsWith('text-')) {
        columnSize = 200
      }

      columns.push({
        accessorKey: fieldKey,
        header: fieldSchema.title || fieldKey,
        size: columnSize,
        cell: ({ row }) => (
          <div className="truncate" title={row.original[fieldKey]}>
            {renderCellValue(fieldKey, row.original[fieldKey], fieldSchema)}
          </div>
        )
      } as ColumnDef<any>)
    })
  } else {
    // 如果没有schema，使用默认列定义
    columns.push(
      {
        accessorKey: 'orderNo',
        header: '订单编号',
        size: 150,
        cell: ({ row }) => (
          <div className="truncate font-mono text-sm" title={row.getValue('orderNo')}>
            {row.getValue('orderNo')}
          </div>
        )
      },
      {
        accessorKey: 'productName',
        header: '产品名称',
        size: 200,
        cell: ({ row }) => (
          <div className="truncate" title={row.getValue('productName')}>
            {row.getValue('productName')}
          </div>
        )
      },
      {
        accessorKey: 'orderType',
        header: '订单类型',
        size: 100,
        cell: ({ row }) => {
          const type = row.getValue('orderType') as string
          return <span>{orderTypeMap[type] || type}</span>
        }
      },
      {
        accessorKey: 'quantity',
        header: '数量',
        size: 100,
        cell: ({ row }) => (
          <span className="text-right">{row.getValue('quantity')}</span>
        )
      },
      {
        accessorKey: 'deliveryDate',
        header: '交货期',
        size: 200,
        cell: ({ row }) => formatDate(row.getValue('deliveryDate'))
      },
      {
        accessorKey: 'status',
        header: '状态',
        size: 100,
        cell: ({ row }) => <span className="text-xs px-2 py-1 rounded-full border border-blue-400/30 bg-blue-400/20 text-blue-100">{String(row.getValue('status'))}</span>
      }
    )
  }

  // 操作列 - 固定在右侧
  columns.push({
    id: 'actions',
    header: '操作',
    size: 150,
    cell: ({ row }) => (
      <div className="flex gap-2 whitespace-nowrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDetailOrder?.(row.original)
          }}
          className="text-blue-300 hover:text-blue-100 hover:bg-blue-500/10"
        >
          详情
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onEditOrder?.(row.original)
          }}
          className="text-blue-300 hover:text-blue-100 hover:bg-blue-500/10"
        >
          编辑
        </Button>
      </div>
    )
  })

  // 创建 TanStack Table 实例
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnPinning: true, // 启用列固定功能
    // @ts-ignore - DataGrid 支持这些选项
    manualPagination: pagination ? true : false,
    // @ts-ignore
    onPaginationChange: undefined,
    state: {
      // @ts-ignore
      columnPinning: {
        left: [],
        right: ['actions'] // 固定操作列在右侧
      },
      // @ts-ignore
      pagination: pagination ? {
        pageIndex: (pagination.current || 1) - 1,
        pageSize: pagination.pageSize || 15
      } : undefined
    }
  })

  // 加载状态
  if (loading) {
    return (
      <DataGridContainer>
        <LoadingDots text="加载中..." />
      </DataGridContainer>
    )
  }

  // 空数据状态
  if (data.length === 0) {
    return (
      <DataGridContainer>
        <div className="text-center py-8 text-blue-200">
          暂无数据
        </div>
      </DataGridContainer>
    )
  }

  return (
    <DataGrid
      table={table}
      recordCount={pagination?.total || data.length}
      isLoading={loading}
      onRowClick={onRowClick}
      tableLayout={{
        columnsResizable: true,
        columnsPinnable: true,
        headerBackground: true,
        headerSticky: true,
      }}
      tableClassNames={{
        header: 'bg-slate-700/70 [&_th]:text-white',
        headerRow: 'border-slate-700/30 hover:bg-slate-700/20 transition-colors',
        body: '',
        bodyRow: 'border-slate-700/20 hover:bg-slate-700/30 transition-colors',
      }}
    >
      <DataGridContainer border={true}>
        <div className="overflow-x-auto rounded-md">
          <DataGridTable />
        </div>
      </DataGridContainer>

      {pagination && (
        <DataGridPagination />
      )}
    </DataGrid>
  )
}
