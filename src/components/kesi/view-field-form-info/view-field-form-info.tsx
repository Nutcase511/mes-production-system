import isNil from 'lodash/isNil'

const FormInfo = ({ value }: { value: any; schema?: any }) => {
  if (isNil(value)) return <span className="text-muted-foreground">空</span>
  // 简化版：直接显示值
  return <span>{String(value)}</span>
}

export { FormInfo }
