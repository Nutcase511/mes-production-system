import dayjs from "dayjs"
import _ from "lodash"

// Type definitions
export interface DataPointConfig {
  fixed?: number
  timeFormat?: {
    hasFormat?: boolean
    format?: string
  }
  valFormat?: 'round' | 'carryUp' | 'slice' | 'hexadecimal' | 'scientific' | 'script'
  formatScript?: string
  polish?: boolean
  tagValue?: {
    enum?: Array<{
      value: any
      label?: string
      label_en?: string
      label_zh?: string
      regex?: string
    }>
  }
  interval?: number
  errview?: string
}

// Utility Functions

/**
 * Ceiling number calculation
 * 向上进位计算
 */
export const ceilNum = (d: number, prex: number): number => {
  if (parseInt(d.toString()) == d) return d
  let len = 1
  let i = 0
  while (parseInt(d.toString()) != d) {
    d = d * 10
    len *= 10
    i++
  }
  const last = Math.abs(i <= prex ? 0 : d % (Math.pow(10, (i - prex))))
  let d1 = d - last
  if (last > 0) {
    d1 = d1 + Math.pow(10, (i - prex))
  }
  d1 = d1 / len
  return d1
}

/**
 * Number slicing by decimal places
 * 按位截断数字
 */
export const sliceNum = (number: number, fixed: number): number => {
  const indexOfDecimal = String(number).indexOf('.')
  const sliceEnd = indexOfDecimal !== -1 ? indexOfDecimal + fixed + 1 : undefined
  const slicedNumber = sliceEnd !== undefined ? String(number).slice(0, sliceEnd) : String(number)
  return Number(slicedNumber)
}

/**
 * Fixed decimal formatting
 * 固定小数位数格式化
 */
export const toFixed = (Dight: number | string, How: number = 2, polish?: boolean): number | string => {
  const v = _.isNumber(Dight) ? Math.round(Number(Dight) * Math.pow(10, How)) / Math.pow(10, How) : Dight
  const pv = (val: number | string): string => {
    const n = val.toString().split('.')
    if (n.length == 1) {
      return val + `${How > 0 ? '.' + _.padEnd('', How, '0') : ''}`
    } else {
      const decimal = n[1]
      return val + _.padEnd('', How - decimal.length, '0')
    }
  }
  return _.isNaN(Number(v)) ? Dight : polish ? pv(v) : v
}

/**
 * Convert number to scientific notation
 * 科学计数法转换
 */
export const scientificNotation = (number: number): string => {
  return number.toExponential()
}

/**
 * Convert number to hexadecimal
 * 十六进制转换
 */
export const numberToHex = (value: number): string => {
  if (typeof value !== 'number') {
    return String(value)
  }

  const integerValue = Math.floor(value)
  const fractionalValue = value - integerValue

  const hexInteger = integerValue.toString(16)

  if (fractionalValue === 0) {
    return hexInteger
  }

  let hexFractional = ''
  const maxFractionalDigits = 6
  let currentFractionalValue = fractionalValue

  while (currentFractionalValue !== 0 && hexFractional.length < maxFractionalDigits) {
    currentFractionalValue *= 16
    const digit = Math.floor(currentFractionalValue)
    hexFractional += digit.toString(16)
    currentFractionalValue -= digit
  }

  return `${hexInteger}.${hexFractional}`
}

/**
 * Format value using custom script
 * 使用自定义脚本格式化值
 */
export const valueFormatScript = (number: number, script: string): any => {
  try {
    return new Function('number', `return (${script})`)(number)
  } catch (error) {
    // error logged in catch block
    return number
  }
}

/**
 * Value formatting with multiple options
 * 值格式化（支持多种格式）
 * @param val - The value to format
 * @param fixed - Number of decimal places
 * @param valFormat - Format type: 'round' | 'carryUp' | 'slice' | 'hexadecimal' | 'scientific' | 'script'
 * @param formatScript - Custom script for formatting
 * @param polish - Whether to pad with zeros
 */
export const valueFormat = (
  val: any,
  fixed?: number,
  valFormat?: string,
  formatScript?: string,
  polish?: boolean
): any => {
  if (_.isNil(val)) return val
  if (valFormat == 'slice') {
    return _.isNumber(val) && _.isNumber(fixed) ? sliceNum(val, fixed) : val
  } else if (valFormat == 'carryUp') {
    return _.isNumber(val) ? ceilNum(val, fixed || 0) : val
  } else {
    const fixedValue = fixed !== undefined ? toFixed(val, fixed, polish) : val
    if (valFormat == 'hexadecimal') {
      return numberToHex(Number(fixedValue))
    } else if (valFormat == 'scientific') {
      return scientificNotation(Number(fixedValue))
    } else if (valFormat == 'script') {
      return valueFormatScript(Number(val), formatScript || '')
    } else {
      return fixedValue
    }
  }
}

/**
 * Convert value with config-based formatting
 * 根据配置转换值
 * @param value - The value to convert
 * @param format - Custom format function
 * @param config - DataPoint configuration
 */
export const convertValue = (
  value: any,
  format?: (value: any) => any,
  config?: DataPointConfig
): any => {
  if (!config) return value

  const { tagValue, fixed, timeFormat, valFormat, formatScript, polish } = config

  let val = value
  if (_.isNil(val)) return val

  // Handle enum values (dropdown type data)
  const language = 'zh' // Default to Chinese, could be made configurable via prop
  if (tagValue && tagValue.enum && _.isArray(tagValue.enum)) {
    tagValue.enum.forEach(o => {
      if (o.value == val) {
        val = o[`label_${language}`] || o.label
      }
      if (o.regex && o.label) {
        val = val + ''
        const lastCommaIndex = _.lastIndexOf(o.label, ',')
        if (lastCommaIndex !== -1) {
          const regex = new RegExp(o.label.slice(0, lastCommaIndex))
          val = val?.replace(regex, o.label.slice(lastCommaIndex + 1))
        }
      }
    })
  }

  // Handle timestamp formatting
  if (timeFormat?.hasFormat && timeFormat?.format) {
    val = dayjs(val).format(timeFormat?.format)
  }

  // Handle value formatting
  if (valFormat || polish) {
    val = valueFormat(val, fixed, valFormat, formatScript, polish)
  }

  if (format && _.isFunction(format)) {
    val = format(val)
  }

  return val
}
