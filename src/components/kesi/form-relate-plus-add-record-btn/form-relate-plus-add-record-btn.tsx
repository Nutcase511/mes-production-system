import * as React from 'react'
import { createAPI } from '@airiot/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { SchemaForm } from '@/components/kesi/schema-form/schema-form'
import { Loader2 } from 'lucide-react'

export interface FormRelatePlusAddRecordBtnProps {
  schema: {
    allowAdd?: boolean
    selectType?: 'single' | 'multiple'
    editDisabled?: boolean
    createDisabled?: boolean
  } & Record<string, any>
  value?: any
  onChange?: (value: any) => void
  meta?: {
    data?: {
      disabled?: boolean
    }
  }
}

const FormRelatePlusAddRecordBtn: React.FC<FormRelatePlusAddRecordBtnProps> = (props) => {
  const { schema, value, onChange, meta } = props
  const tableID = schema?.relate?.id

  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [tableSchema, setTableSchema] = React.useState<any>(null)

  // Check if button should be shown
  const isDisabled = meta?.data?.disabled ?? schema.editDisabled ?? schema.createDisabled ?? false

  React.useEffect(() => {
    if (open && tableID && !tableSchema) {
      setLoading(true)
      const schemaAPI = createAPI({
        resource: 'core/t/schema',
        name: 'schema'
      })

      schemaAPI.get(tableID)
        .then((res) => {
          setTableSchema(res)
          setLoading(false)
        })
        .catch((err) => {
          setLoading(false)
        })
    }
  }, [open, tableID, tableSchema])

  // 实现表单提交处理
  const handleSubmit = async (formData: Record<string, any>) => {
    if (!tableID) return

    setSubmitting(true)
    try {
      const dataAPI = createAPI({
        resource: `core/t/${tableID}/d`,
        name: 'data'
      })

      const result = await dataAPI.save(formData)
      const newItem = { ...formData, id: result.InsertedID || result.id }

      // 根据选择类型更新值
      if (schema.selectType === 'multiple') {
        onChange?.([...(value || []), newItem])
      } else {
        onChange?.(newItem)
      }

      setOpen(false)
    } catch (err) {
    } finally {
      setSubmitting(false)
    }
  }

  // 从 tableSchema.schema.fields 构建 formSchema
  const formSchema = React.useMemo(() => {
    const fields = tableSchema?.schema?.fields || []
    return fields.map((field: any) => ({
      key: field.key,
      name: field.key,
      controlType: field.controlType || undefined
    }))
  }, [tableSchema])

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isDisabled}
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        新增记录
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增记录 - {tableSchema?.title || tableSchema?.name}</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">加载中...</span>
            </div>
          ) : schema ? (
            <div className="py-4">
              <SchemaForm
                formId={`add-record-${tableID}`}
                schema={schema}
                formSchema={formSchema}
                onSubmit={handleSubmit}
                isValid={false}
              >
                {() => (
                  <div className="mt-6 pt-4 border-t flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      disabled={submitting}
                    >
                      取消
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          保存中...
                        </>
                      ) : (
                        '保存'
                      )}
                    </Button>
                  </div>
                )}
              </SchemaForm>
            </div>
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">
              无法加载表单配置
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export { FormRelatePlusAddRecordBtn }
