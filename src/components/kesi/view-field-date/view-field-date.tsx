import isNil from 'lodash/isNil'
import dayjs from 'dayjs'

const DateField = ({ value, schema }: { value: any; schema?: any }) => {
  if (isNil(value)) return <span className="text-muted-foreground">空</span>

  let format = 'YYYY-MM-DD'

  // 从 filedFormat 获取格式
  if (schema?.filedFormat) {
    format = schema.filedFormat
  } else if (schema?.format || schema?.format2) {
    // 兼容旧格式
    const formatMap: Record<string, string> = {
      'ym': 'YYYY-MM',
      'date': 'YYYY-MM-DD',
      'datetime': 'YYYY-MM-DD HH:mm:ss',
      'ymdh': 'YYYY-MM-DD HH',
    }
    format = formatMap[schema.format || schema.format2] || format
  }

  return <span>{dayjs(value).format(format)}</span>
}

export { DateField }
