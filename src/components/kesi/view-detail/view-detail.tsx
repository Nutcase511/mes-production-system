import React from 'react'
import { useModelGet } from '@airiot/client'
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Loader2 } from 'lucide-react'
import { FormSchemaItem, SchemaForm } from '@/components/kesi/schema-form/schema-form'
import { tableConverter } from "@/lib/view-table-converter";
interface ViewDetailContentProps {
  itemId: string
  classNames?: Record<'form' | 'group' | 'field' | 'label' | 'input' | 'description' | 'error', string>
  formSchema?: FormSchemaItem[]
}

const ViewDetail: React.FC<ViewDetailContentProps> = ({ itemId, classNames, formSchema }) => {
  const { data, loading, model } = useModelGet({ id: itemId })

  const formId = `view-form-${itemId}`

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {data
            ? (model.displayField && data[model.displayField]) || data?._label || data?.name
            : model?.title}
        </DialogTitle>
      </DialogHeader>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : data ? (
        <ScrollArea className="max-h-[70vh] pr-3">
          <SchemaForm
            formId={formId}
            defaultValues={data}
            schema={model}
            classNames={classNames ? classNames : {
              form: '',
              group: 'grid grid-cols-2 gap-4',
              field: 'w-fit gap-2 min-w-0',
              label: 'flex-shrink-0 text-right',
              input: 'flex-1 min-w-0',
              description: '',
              error: ''
            }}
            schameConvert={tableConverter}
            formSchema={formSchema || model.formSchema || model.form}
          />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <div className="flex items-center justify-center py-12 text-slate-500">
          暂无数据
        </div>
      )}

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">关闭</Button>
        </DialogClose>
      </DialogFooter>
    </>
  )
}

export { ViewDetail }
