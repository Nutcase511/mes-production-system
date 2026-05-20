import isNil from 'lodash/isNil'
import isNumber from 'lodash/isNumber'

const Number = ({ value, schema }: { value: any; schema?: any }) => {
  if (isNil(value)) return <span className="text-muted-foreground">空</span>

  let displayValue = value

  // 小数位数格式化
  if (isNumber(value) && schema?.decimal) {
    displayValue = value.toFixed(schema.decimal)
  }

  // 千分位格式化
  if (schema?.bitNum) {
    try {
      return <span>{new Intl.NumberFormat('zh-CN', { notation: schema.bitNum as any }).format(displayValue)}</span>
    } catch (e) {
      // 格式化失败，返回原值
    }
  }

  return <span>{displayValue}</span>
}

export { Number }
