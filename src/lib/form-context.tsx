import * as React from "react"

export interface FormContextValue {
  onReset?: () => void
  loading?: boolean
  handleSubmit?: () => void
}

export const FormContext = React.createContext<FormContextValue>({
  onReset: undefined,
  loading: false,
  handleSubmit: undefined
})
