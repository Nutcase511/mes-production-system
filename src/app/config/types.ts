// App config types
export interface ComponentConfig {
  name: string
  label: string
  type: string
  default?: any
  description?: string
  options?: Array<{ label: string; value: string }>
  [key: string]: any
}

export interface ComponentPropsConfig {
  name: string
  label: string
  type: string
  default?: any
  description?: string
  required?: boolean
  [key: string]: any
}

export interface PropConfig {
  name: string
  label: string
  type: string
  default?: any
  description?: string
  options?: Array<{ label: string; value: string }>
  [key: string]: any
}

export interface DataSourceConfig {
  type: string
  name: string
  config?: Record<string, any>
}