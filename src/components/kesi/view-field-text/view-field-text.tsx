import isNil from 'lodash/isNil'
import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'

const Text = ({ value }: { value: any }) => {
  if (isNil(value)) return <span className="text-muted-foreground">空</span>
  // 处理对象类型的值
  if (isObject(value) && !isArray(value)) {
    const obj = value as Record<string, any>
    // 优先显示 name，其次显示 id，最后显示 JSON
    if ('name' in obj) return <span>{obj.name}</span>
    if ('id' in obj) return <span>{obj.id}</span>
    return <span>{JSON.stringify(value)}</span>
  }
  // 处理数组类型
  if (isArray(value)) {
    const displayValues = (value as any[]).map((item: any) => {
      if (isObject(item)) {
        const obj = item as Record<string, any>
        return obj.name || obj.id || JSON.stringify(item)
      }
      return item
    })
    return <span>{displayValues.join(', ')}</span>
  }
  return <span>{value}</span>
}
export { Text }