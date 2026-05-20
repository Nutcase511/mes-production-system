import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { FormTableView } from '@/components/kesi/form-table-view/form-table-view'
import type { FormTableViewColumn } from '@/components/kesi/form-table-view/form-table-view'
import { FormEditableCard } from '@/components/kesi/form-editable-card/form-editable-card'

export interface FormEditableTableProps {
  onChange?: (value: any[] | null) => void
  value?: any[]
  schema?: {
    key?: string
    disabled?: boolean
    minCount?: number
    maxCount?: number
    items?: {
      formSchema?: Array<{
        key: string
      }>
      properties?: Record<string, any>
    }
    defaultVal?: any[]
    displayForm?: 'grid' | 'card'
    uniqueFields?: string[]
    uniqueRow?: boolean
    fieldRules?: {
      errorNotice?: any[]
    }
    showPagination?: boolean
    btnText?: Record<string, string>
    // 权限控制
    createAddBtn?: {
      show?: boolean
      userRange?: string
      users?: any[]
      roles?: any[]
    }
    editAddBtn?: {
      show?: boolean
      userRange?: string
      users?: any[]
      roles?: any[]
    }
    createDelBtn?: {
      show?: boolean
      userRange?: string
      users?: any[]
      roles?: any[]
    }
    editDelBtn?: {
      show?: boolean
      userRange?: string
      users?: any[]
      roles?: any[]
    }
    cardLayout?: '1' | '2' | '3'
  }
  record?: any
}

const FormEditableTable: React.FC<FormEditableTableProps> = (props) => {
  const { schema } = props
  const { onChange, value = [] } = props || {}

  const [dataSource, setDataSource] = React.useState<any[]>(value || schema?.defaultVal || [])
  const [selectedRows, setSelectedRows] = React.useState<any[]>([])

  // 批量删除
  const handleBatchDelete = () => {
    const data = dataSource.filter((item) => !selectedRows.some(row => row?.key === item?.key))
    setDataSource(data)
    setSelectedRows([])
    onChange?.(data.length ? data : null)
  }

  // 添加新行
  const handleAdd = () => {
    const newData = { key: Date.now() }
    const newDataArray = [...dataSource, newData]
    setDataSource(newDataArray)
    onChange?.(newDataArray)
  }

  // 构建列配置
  const columns: FormTableViewColumn[] = React.useMemo(() => {
    const items = schema?.items
    const formSchema = items?.formSchema
    if (!formSchema) return []
    const properties = items.properties || {}
    return formSchema.map(field => {
      const key = field.key
      const item = properties[key] || {}
      return {
        key: item.key || key,
        dataIndex: item.key || key,
        title: (
          <span>
            {item.need && <span className="text-destructive mr-1">*</span>}
            {item.title || key}
          </span>
        ),
        schema: item,
        editable: true,
        width: (() => {
          if (item.width) return item.width
          switch (item.fieldType) {
            case 'attachments': return 280
            case 'select': return 160
            case 'inputNumber': return 140
            case 'datePicker': return 180
            case 'input': return 160
            default: return 180  // relate / user / 其他
          }
        })(),
      }
    })
  }, [schema?.items])

  if (!columns || columns.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4">
        表格没有配置任何字段，请先配置字段
      </div>
    )
  }

  const displayForm = schema?.displayForm || 'grid'
  const canAdd = !schema?.maxCount || dataSource.length < schema.maxCount
  const canDelete = !schema?.minCount || dataSource.length > schema.minCount

  // 包装 onChange 以同时更新本地状态和外部值
  const handleChange = React.useCallback((newValue: any[] | null) => {
    const data = newValue || []
    setDataSource(data)
    onChange?.(data.length ? data : null)
  }, [onChange])

  const tableProps = {
    value: dataSource,
    onChange: handleChange,
    schema,
    columns,
    selectedRows,
    setSelectedRows,
    setDataSource,
    setErrors: () => { }, // TODO: 实现错误处理
    record: props.record,
  }

  return (
    <div id={`EditTable-${schema?.key}`} className="w-full">
      {/* 添加按钮 */}
      {canAdd && (
        <Button
          onClick={handleAdd}
          type="button"
          variant="default"
          size="sm"
          disabled={schema?.disabled}
          className="mb-2"
        >
          <Plus className="h-4 w-4 mr-1" />
          {schema?.btnText?.add || '添加新行'}
        </Button>
      )}

      {/* 批量删除按钮 */}
      {displayForm === 'grid' && canDelete && (
        <Button
          onClick={handleBatchDelete}
          variant="outline"
          size="sm"
          disabled={schema?.disabled || selectedRows.length === 0}
          className="mb-2 ml-2"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {schema?.btnText?.delete || '删除'}
        </Button>
      )}

      {/* 表格或卡片显示 */}
      {displayForm === 'card' ? (
        <FormEditableCard {...tableProps} />
      ) : (
        <FormTableView {...tableProps} />
      )}
    </div>
  )
}

export { FormEditableTable }
