import * as React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { TC2Provider } from '@/lib/table-context'
import { formConverter } from '@/lib/view-form-converter'
import { FormProvider, useForm } from '@airiot/client'
import { formFieldConverter } from '@/lib/form-field-converter'

export interface FormTableViewColumn {
  key: string
  dataIndex: string
  title: React.ReactNode
  schema: any
  editable: boolean
  width?: number
  render?: (value: any, record: any) => React.ReactNode
}

export interface FormTableViewProps {
  /** 当前值 */
  value?: any[]
  /** 值变化回调 */
  onChange?: (value: any[]) => void
  /** 列配置 */
  columns?: FormTableViewColumn[]
  /** 选中的行 */
  selectedRows?: any[]
  /** 设置选中行 */
  setSelectedRows?: (rows: any[]) => void
  /** 字段配置 */
  schema?: any
}

const FormTableView: React.FC<FormTableViewProps> = (props) => {
  const { value = [], onChange, schema, columns, selectedRows, setSelectedRows } = props || {}

  const handleSave = (row: any) => {
    const newValue = value.map((d: any) => (d?.key === row?.key ? row : d))
    onChange?.(newValue)
  }

  const handleSelectRow = (row: any, checked: boolean) => {
    const currentSelected = selectedRows || []
    if (checked) {
      setSelectedRows?.([...currentSelected, row])
    } else {
      setSelectedRows?.(currentSelected.filter((r: any) => r?.key !== row?.key))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows?.([...value])
    } else {
      setSelectedRows?.([])
    }
  }

  const isAllSelected = value.length > 0 && (selectedRows?.length || 0) === value.length

  if (!columns || columns.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 border rounded-md">
        暂无数据
      </div>
    )
  }

  return (
    <div className="border rounded-md overflow-x-auto">
      <table className="border-collapse" style={{ minWidth: 'max-content', width: '100%' }}>
        <thead className="bg-muted/50">
          <tr>
            {/* 总是显示复选框列 */}
            <th className="px-4 py-2 text-left border-b" style={{ width: 50, minWidth: 50 }}>
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                disabled={schema?.disabled}
              />
            </th>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-2 text-left border-b whitespace-nowrap"
                style={{ width: col.width, minWidth: col.width }}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {value?.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-muted-foreground" colSpan={columns.length + 1}>
                暂无数据
              </td>
            </tr>
          ) : (
            value?.map((record: any, rowIndex: number) => (
              <tr key={record?.key || rowIndex} className="border-b hover:bg-muted/30">
                {/* 总是显示复选框 */}
                <td className="px-4 py-2" style={{ width: 50, minWidth: 50 }}>
                  <Checkbox
                    checked={(selectedRows || []).some((r: any) => r?.key === record?.key)}
                    onCheckedChange={(checked) => handleSelectRow(record, checked as boolean)}
                    disabled={schema?.disabled}
                  />
                </td>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2"
                    style={{ width: col.width, minWidth: col.width }}>
                    {col.editable ? (
                      <EditCell
                        schema={col.schema}
                        record={record}
                        onSave={handleSave}
                        disabled={schema?.disabled}
                      />
                    ) : (
                      <span>{record[col.dataIndex]}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// 可编辑单元格
const EditCell: React.FC<{
  schema: any
  record: any
  onSave: (row: any) => void
  disabled?: boolean
}> = ({ schema, record, onSave, disabled }) => {
  const value = record[schema.key]

  const handleChange = (newValue: any) => {
    const updatedRecord = { ...record, [schema.key]: newValue }
    onSave(updatedRecord)
  }

  const field = formFieldConverter({ ...schema, disabled })

  const FieldController = formConverter(schema, {})

  const methods = useForm()

  return (
    <FormProvider {...methods} >
      <TC2Provider editingSchema={record}>
        <FieldController {...field} value={value} record={record} onChange={handleChange} />
      </TC2Provider>
    </FormProvider>
  )

}

export { FormTableView }
