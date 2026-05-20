import { FormProvider, useForm, type UseFormPropsExtended } from '@airiot/client'
import { type ReactNode } from 'react'

type FormProps = UseFormPropsExtended & {
  formId: string
  children: ReactNode
  onSubmit: (data: any) => void
  onEffect?: (formData: any, setFormData: (data: any) => void) => void
  classNames?: Record<'form' | 'field' | 'label' | 'input' | 'description' | 'error', string>
}

const Form = ({ formId, children, onSubmit, onEffect, classNames, ...props } : FormProps ) => {
  const methods = useForm({ ...props, onEffect })
  return (
    <FormProvider {...methods} classNames={classNames}>
      <form id={formId} onSubmit={methods.handleSubmit(onSubmit)} className={classNames?.form}>
        {children}
      </form>
    </FormProvider>
  )
}

export { Form }