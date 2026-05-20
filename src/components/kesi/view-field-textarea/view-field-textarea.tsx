import isNil from 'lodash/isNil'
import isObject from 'lodash/isObject'

const Textarea = ({ value }: { value: any }) => {
  if (isNil(value)) return <span className="text-muted-foreground">空</span>
  // 处理对象类型的值
  if (isObject(value) && !Array.isArray(value)) {
    const obj = value as Record<string, any>
    if ('name' in obj) return <div className="whitespace-pre-wrap break-word">{obj.name}</div>
    if ('id' in obj) return <div className="whitespace-pre-wrap break-word">{obj.id}</div>
    return <div className="whitespace-pre-wrap break-word">{JSON.stringify(value)}</div>
  }
  return <div className="whitespace-pre-wrap break-word">{value}</div>
}

export { Textarea }
