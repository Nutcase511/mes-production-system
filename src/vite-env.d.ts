/// <reference types="vite/client" />

import { RowData } from '@tanstack/react-table'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    headerTitle?: string
    headerClassName?: string
    cellClassName?: string
    skeleton?: React.ReactNode
    expandedContent?: (row: TData) => React.ReactNode
    isSticky?: boolean
    fieldSchema?: any
  }
}

interface ImportMetaEnv {
  readonly VITE_AIRIOT_APP_ID: string
  readonly VITE_AIRIOT_API_URL: string
  readonly VITE_AIRIOT_APP_SECRET: string
  readonly VITE_AIRIOT_USER_NAME: string
  readonly VITE_AIRIOT_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
