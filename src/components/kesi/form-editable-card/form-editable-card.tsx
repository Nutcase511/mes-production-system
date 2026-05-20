import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { formConverter } from '@/lib/view-form-converter'
import { FormProvider, useForm } from '@airiot/client'
import { formFieldConverter } from '@/lib/form-field-converter'

export interface FormEditableCardProps {
  /** 当前值 */
  value?: any[]
  /** 值变化回调 */
  onChange?: (value: any[] | null) => void
  /** 列配置 */
  columns?: Array<{
    key: string
    dataIndex: string
    title: React.ReactNode
    schema: any
    editable: boolean
  }>
  /** 是否显示删除按钮 */
  showDelBtn?: boolean
  /** 字段配置 */
  schema?: any
}

const FormEditableCard: React.FC<FormEditableCardProps> = (props) => {
  const { value, onChange, schema, columns, showDelBtn } = props

  const handleDelete = (key: string | number) => {
    const data = value?.filter((item: any) => item?.key !== key) || []
    onChange?.(data.length ? data : null)
  }

  const handleFieldChange = (record: any, fieldKey: string, newValue: any) => {
    const updatedRecord = { ...record, [fieldKey]: newValue }
    const newData = value?.map((d: any) => (d?.key === record?.key ? updatedRecord : d)) || []
    onChange?.(newData)
  }

  if (!columns || columns.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4">
        卡片没有配置任何字段，请先配置字段
      </div>
    )
  }

  if (!value || value.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 border rounded-md">
        暂无数据
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {value?.map((record: any, index: number) => (
        <Card key={record?.key || index} className="relative">
          {showDelBtn && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(record?.key || index)}
              disabled={!!(schema?.disabled || (schema?.minCount && (value?.length ?? 0) <= schema.minCount))}
              className="absolute top-2 right-2 z-10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              记录 {index + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {columns.map((col) => (
              <div key={col.key} className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {col.schema.need && <span className="text-destructive mr-1">*</span>}
                  {col.title}
                </label>
                <div>
                  <FieldCell
                    schema={col.schema}
                    value={record[col.dataIndex]}
                    onChange={(newValue) => handleFieldChange(record, col.dataIndex, newValue)}
                    record={record}
                    disabled={schema?.disabled}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// 字段单元格渲染器（与 EditableTable 共享）
const FieldCell: React.FC<{
  schema: any
  value: any
  onChange: (value: any) => void
  record: any
  disabled?: boolean
}> = ({ schema, value, onChange, record, disabled }) => {
  // 使用 form-widget 的字段选择器来渲染不同的字段类型
  const actualSchema = disabled ? { ...schema, disabled: true } : schema

  const field = formFieldConverter(actualSchema)

  const FieldController = formConverter(schema, {})

  const methods = useForm()

  return (
    <FormProvider {...methods} >
      <FieldController {...field} value={value} record={record} onChange={onChange} />
    </FormProvider>
  )

}

export { FormEditableCard }
