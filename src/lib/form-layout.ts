export interface FormLayout {
  cols: number
  labelLayout: 'vertical' | 'horizontal'
  maxWidth?: 'sm' | 'md' | 'lg' | 'full'
}

const MAX_WIDTH_MAP: Record<string, { form: string; dialog: string }> = {
  sm: { form: 'max-w-[480px]', dialog: 'sm:max-w-lg' },
  md: { form: 'max-w-[640px]', dialog: 'sm:max-w-2xl' },
  lg: { form: 'max-w-[960px]', dialog: 'sm:max-w-4xl' },
}

export type FormLayoutClassNames = {
  form?: string
  group?: string
  field?: string
  label?: string
  input?: string
  description?: string
  error?: string
  orientation?: string
  groupStyle?: React.CSSProperties
}

export type FormLayoutResult = {
  classNames: FormLayoutClassNames | undefined
  dialog: string
}

export function formLayoutToClassNames(layout?: FormLayout | null): FormLayoutResult {
  const defaultDialog = 'sm:max-w-4xl'
  if (!layout) return { classNames: undefined, dialog: defaultDialog }
  const isHorizontal = layout.labelLayout === 'horizontal'
  const groupStyle = layout.cols > 1
    ? { display: 'grid' as const, gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`, gap: 16 }
    : undefined
  const widthCfg = layout.maxWidth && layout.maxWidth !== 'full' ? MAX_WIDTH_MAP[layout.maxWidth] : undefined
  return {
    classNames: {
      orientation: isHorizontal ? 'horizontal' : undefined,
      form: widthCfg ? `mx-auto w-full ${widthCfg.form}` : undefined,
      group: layout.cols > 1 ? 'grid' : undefined,
      groupStyle,
      field: isHorizontal ? 'flex flex-row items-center gap-2 min-w-0' : undefined,
      label: isHorizontal ? '!w-20 flex-shrink-0 text-right' : undefined,
      input: isHorizontal ? 'flex-1 min-w-0' : undefined,
    },
    dialog: widthCfg ? widthCfg.dialog : defaultDialog,
  }
}
