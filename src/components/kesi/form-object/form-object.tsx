import * as React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { FormField } from '@/components/kesi/form-field/form-field'
import { formConverter } from '@/lib/view-form-converter'
import { useFormContext } from '@airiot/client'

export interface FormObjectProps {
  /** 字段名 */
  name?: string
  /** 值变化回调 */
  onChange?: (value: any) => void
  schema?: {
    key?: string
    title?: string
    description?: string
    disabled?: boolean
    properties?: Record<string, any>
    formSchema?: Array<{
      key: string
      title?: string
    }>
    btnText?: {
      edit?: string
      confirm?: string
      cancel?: string
    }
  }
  meta?: {
    submitFailed?: boolean
    error?: string
  }
  className?: string
}

const FormObject: React.FC<FormObjectProps> = (props) => {
  const { meta, schema, name, className } = props
  const [isOpen, setIsOpen] = React.useState(false)

  const properties = schema?.properties || {}
  // 如果没有 formSchema，从 properties 的 keys 中自动生成
  const formSchema = schema?.formSchema || Object.keys(properties).map(key => ({
    key,
    title: properties[key]?.title
  }))

  // 从 FormProvider 获取当前的值
  const { watch } = useFormContext()
  const fieldName = name || schema?.key || 'object'
  watch(fieldName)

  return (
    <div id={`FormObject-${schema?.key}`} className={`w-full ${className}`}>
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
                {schema?.title || schema?.key || '对象'}
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-4 space-y-4">
              {schema?.description && (
                <p className="text-sm text-muted-foreground mb-4">{schema.description}</p>
              )}

              {/* 直接在折叠面板中渲染表单字段 */}
              <div className="space-y-4">
                {formSchema.map((field) => {
                  const fieldKey = field.key
                  const fieldSchema = properties[fieldKey] || {}
                  const FormComponent = formConverter(fieldSchema, { controlType: fieldSchema.controlType })

                  return (
                    <FormField
                      key={fieldKey}
                      name={`${fieldName}.${fieldKey}`}
                      schema={fieldSchema}
                      label={fieldSchema.title || field.title || fieldKey}
                    >
                      <FormComponent />
                    </FormField>
                  )
                })}
              </div>

              {/* 错误信息 */}
              {meta?.error && (
                <p className="text-sm text-destructive">{meta.error}</p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  )
}

export { FormObject }
