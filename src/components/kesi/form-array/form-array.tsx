import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, ChevronDown, ChevronRight, Edit, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { FormField } from '@/components/kesi/form-field/form-field'
import { formConverter } from '@/lib/view-form-converter'
import { useForm, FormProvider, useFieldArray, useFormContext } from '@airiot/client'

// 用于生成唯一的空值占位符
const EMPTY_PLACEHOLDER = Symbol('empty')

export interface FormArrayProps {
  name?: string
  schema?: {
    key?: string
    title?: string
    description?: string
    disabled?: boolean
    minCount?: number
    maxCount?: number
    items?: {
      type?: string
      controlType?: string
      pcaData?: []
      formSchema?: Array<{
        key: string
        title?: string
      }>
      properties?: Record<string, any>
    }
    defaultVal?: any[]
    btnText?: {
      add?: string
      clear?: string
      edit?: string
      delete?: string
      confirm?: string
      cancel?: string
    }
  }
  meta?: {
    submitFailed?: boolean
    error?: string
  }
  className?: string,
}

const FormArray: React.FC<FormArrayProps> = (props) => {
  const { meta, schema, name, className } = props
  const [isOpen, setIsOpen] = React.useState(false)
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const items = schema?.items
  const properties = items?.properties || {}
  // 判断 items 是否为基础类型（非对象类型）
  const isPrimitiveItem = items?.type && items.type !== 'object'
  // 如果没有 formSchema，从 properties 的 keys 中自动生成
  const formSchema = items?.formSchema || Object.keys(properties).map(key => ({
    key,
    title: properties[key]?.title
  }))

  // 从 FormProvider 获取 control
  const { control } = useFormContext()

  // 使用 useFieldArray 管理数组字段（适用于基础类型和对象类型）
  const { fields, append, remove, update } = useFieldArray({
    name: name || schema?.key || 'items',
    control,
  })

  // 获取当前数组值（用于基础类型）
  const fieldName = name || schema?.key || 'items'

  // 获取按钮文本
  const getBtnText = (key: 'add' | 'clear' | 'edit' | 'delete' | 'confirm' | 'cancel', defaultValue: string) => {
    return schema?.btnText?.[key] || defaultValue
  }

  // 添加新元素
  const handleAdd = () => {
    if (schema?.maxCount && fields.length >= schema.maxCount) {
      return
    }
    // 根据类型添加不同的默认值
    if (isPrimitiveItem) {
      // 基础类型：使用 Symbol 作为唯一占位符，确保可以添加多个空值
      const defaultValue = items?.type === 'number' ? 0 : items?.type === 'boolean' ? false : EMPTY_PLACEHOLDER
      append(defaultValue, { shouldFocus: false })
    } else {
      // 对象类型：添加空对象
      append({}, { shouldFocus: false })
    }
  }

  // 清空所有元素
  const handleClear = () => {
    if (schema?.minCount && schema.minCount > 0) {
      return
    }
    remove()
  }

  // 删除元素
  const handleDelete = (index: number) => {
    if (schema?.minCount && fields.length <= schema.minCount) {
      return
    }
    remove(index)
  }

  // 打开编辑弹窗
  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setIsDialogOpen(true)
  }

  // 保存编辑 - 使用 update 方法
  const handleSave = (data: any) => {
    if (editingIndex !== null) {
      // 移除自动生成的 id 字段（如果存在），避免与用户定义的 id 字段冲突
      const { id, ...cleanData } = data
      update(editingIndex, cleanData)
    }
    setIsDialogOpen(false)
    setEditingIndex(null)
  }

  // 生成卡片标题
  const getCardTitle = (field: any, index: number, properties: any) => {
    // 尝试从第一个字段获取标题
    if (formSchema.length > 0) {
      const firstKey = formSchema[0].key
      const firstValue = field?.[firstKey]
      if (firstValue !== undefined && firstValue !== null && firstValue !== '') {
        return `${formSchema[0].title || properties?.[firstKey]?.title || firstKey}: ${firstValue}`
      }
    }
    // console.log(properties)
    return `项目 ${index + 1}`
  }

  const canAdd = !schema?.maxCount || fields.length < schema.maxCount
  const canClear = !schema?.minCount || schema.minCount === 0

  return (
    <div id={`FormArray-${schema?.key}`} className={`w-full ${className}`}>
      <Card>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between rounded-t-lg hover:bg-muted/50"
              type="button"
            >
              <span className="flex items-center gap-2">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                {schema?.title || schema?.key || '数组'}
                <span className="text-muted-foreground">({fields.length})</span>
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-4 space-y-4">
              {schema?.description && (
                <p className="text-sm text-muted-foreground">{schema.description}</p>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2">
                {canAdd && (
                  <Button
                    onClick={handleAdd}
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={schema?.disabled}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {getBtnText('add', '添加')}
                  </Button>
                )}
                {canClear && fields.length > 0 && (
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    size="sm"
                    disabled={schema?.disabled}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {getBtnText('clear', '清空')}
                  </Button>
                )}
              </div>

              {/* 卡片列表 */}
              {fields.length === 0 ? (
                <div className="text-sm text-muted-foreground p-8 border border-dashed rounded-lg text-center bg-muted/30">
                  暂无数据，点击"添加"按钮添加新项目
                </div>
              ) : isPrimitiveItem ? (
                /* 基础类型数组：使用 formConverter 渲染组件 */
                <div className="space-y-3">
                  {fields.map((field: any, index: number) => {
                    const FormComponent = formConverter(items, { controlType: items?.controlType })
                    return (
                      <div key={field.id} className="flex gap-2 items-center">
                        <div className="flex-1">
                          <FormField
                            name={`${fieldName}.${index}`}
                            schema={items}
                            label={false}
                          >
                            <FormComponent />
                          </FormField>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(index)}
                          disabled={Boolean(schema?.disabled || (schema?.minCount && fields.length <= schema.minCount))}
                          className="h-9 w-9 p-0 shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* 对象类型数组：卡片网格 */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fields.map((field: any, index: number) => (
                    <Card key={field.id} className="relative hover:shadow-md transition-shadow flex flex-col">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">
                          {getCardTitle(field, index, properties)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 p-3 pt-0 flex-1 flex flex-col">
                        {/* 显示摘要信息 */}
                        <div className="space-y-1.5 flex-1">
                          {formSchema.slice(0, 3).map((formField) => {
                            const fieldKey = formField.key
                            const fieldValue = field?.[fieldKey]
                            if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
                              return null
                            }
                            return (
                              <div key={fieldKey} className="text-sm flex justify-between items-center py-1 border-b border-border/40 last:border-0">
                                <span className="text-muted-foreground font-medium">
                                  {formField.title || properties[fieldKey]?.title || fieldKey}
                                </span>
                                <span className="font-medium truncate ml-2 max-w-[60%]">{String(fieldValue)}</span>
                              </div>
                            )
                          })}
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex gap-2 pt-2 mt-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(index)}
                            disabled={schema?.disabled}
                            className="flex-1 h-7 px-2 text-xs"
                          >
                            <Edit className="h-3 w-3" />
                            <span className="ml-1">{getBtnText('edit', '修改')}</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(index)}
                            disabled={Boolean(schema?.disabled || (schema?.minCount && fields.length <= schema.minCount))}
                            className="flex-1 h-7 px-2 text-xs"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="ml-1">{getBtnText('delete', '删除')}</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* 错误信息 */}
              {meta?.error && (
                <p className="text-sm text-destructive">{meta.error}</p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* 编辑弹窗 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null
                ? `${getBtnText('edit', '修改')}`
                : getBtnText('edit', '修改')}
            </DialogTitle>
            <DialogDescription>
              编辑项目的详细信息
            </DialogDescription>
          </DialogHeader>
          {editingIndex !== null && (
            <EditItemForm
              initialValues={fields[editingIndex] || {}}
              formSchema={formSchema}
              properties={properties}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingIndex(null)
              }}
              btnText={schema?.btnText}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 编辑表单组件 - 独立表单，不依赖父表单上下文
interface EditItemFormProps {
  initialValues: any
  formSchema: Array<{ key: string; title?: string }>
  properties: Record<string, any>
  onSave: (data: any) => void
  onCancel: () => void
  btnText?: {
    confirm?: string
    cancel?: string
  }
}

const EditItemForm: React.FC<EditItemFormProps> = ({
  initialValues,
  formSchema,
  properties,
  onSave,
  onCancel,
  btnText
}) => {
  // 创建独立的表单实例
  const methods = useForm({
    defaultValues: initialValues,
    mode: 'onSubmit',
  })

  const handleSubmit = (data: any) => {
    onSave(data)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-4">
        {formSchema.map((field) => {
          const fieldKey = field.key
          const fieldSchema = properties[fieldKey] || {}
          const FormComponent = formConverter(fieldSchema, { controlType: fieldSchema.controlType })

          return (
            <FormField
              key={fieldKey}
              name={fieldKey}
              schema={fieldSchema}
              label={fieldSchema.title || field.title || fieldKey}
            >
              <FormComponent />
            </FormField>
          )
        })}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            {btnText?.cancel || '取消'}
          </Button>
          <Button type="submit">
            {btnText?.confirm || '确认'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

export { FormArray }
