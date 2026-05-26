import * as React from 'react'

interface EditableTableProps {
  value?: any[]
  onChange?: (value: any[]) => void
  tableFields?: any
  relatedTablesData?: any
  loadingRelatedTables?: boolean
  onLoadRelatedTable?: (tableId: string) => void
}

const EditableTable: React.FC<EditableTableProps> = ({ value = [], onChange, tableFields }) => {
  const columns = Array.isArray(tableFields) ? tableFields : []

  const handleCellChange = (rowIndex: number, fieldKey: string, newValue: any) => {
    const updated = [...value]
    updated[rowIndex] = { ...updated[rowIndex], [fieldKey]: newValue }
    onChange?.(updated)
  }

  const handleAddRow = () => {
    const newRow: Record<string, any> = {}
    columns.forEach((col: any) => {
      newRow[col.key || col.dataIndex] = ''
    })
    onChange?.([...value, newRow])
  }

  const handleDeleteRow = (rowIndex: number) => {
    const updated = value.filter((_, i) => i !== rowIndex)
    onChange?.(updated)
  }

  if (columns.length === 0) {
    return <div className="text-muted-foreground text-sm p-2">暂无表格字段配置</div>
  }

  return (
    <div className="border rounded-md overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50">
            {columns.map((col: any) => (
              <th key={col.key || col.dataIndex} className="px-3 py-2 text-left font-medium">
                {col.title || col.key || col.dataIndex}
              </th>
            ))}
            <th className="px-3 py-2 w-16">操作</th>
          </tr>
        </thead>
        <tbody>
          {value.map((row: any, rowIndex: number) => (
            <tr key={rowIndex} className="border-t">
              {columns.map((col: any) => {
                const fieldKey = col.key || col.dataIndex
                return (
                  <td key={fieldKey} className="px-3 py-1">
                    <input
                      className="w-full bg-transparent border-b border-transparent hover:border-input focus:border-primary focus:outline-none px-1 py-0.5"
                      value={row[fieldKey] ?? ''}
                      onChange={(e) => handleCellChange(rowIndex, fieldKey, e.target.value)}
                    />
                  </td>
                )
              })}
              <td className="px-3 py-1">
                <button
                  className="text-destructive hover:text-destructive/80 text-xs"
                  onClick={() => handleDeleteRow(rowIndex)}
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-2 border-t">
        <button
          className="text-primary hover:text-primary/80 text-sm"
          onClick={handleAddRow}
        >
          + 添加行
        </button>
      </div>
    </div>
  )
}

export { EditableTable }
