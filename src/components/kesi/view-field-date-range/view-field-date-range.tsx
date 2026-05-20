import isNil from 'lodash/isNil'
import dayjs from 'dayjs'

const DateRange = ({ value, schema }: { value: any; schema?: any }) => {
  if (isNil(value)) return <span className="text-muted-foreground">空</span>

  let format = 'YYYY-MM-DD'
  if (schema?.filedFormat) {
    format = schema.filedFormat
  }

  const [startDateString, endDateString] = (value || '').split(' - ')
  const endShow = endDateString
    ? dayjs(endDateString).format(format)
    : ((schema?.NullShow === 'forever' || schema?.nullShow === 'forever') ? '长期' : '至今')

  return (
    <span>
      {dayjs(startDateString).format(format)} - {endShow}
    </span>
  )
}

export { DateRange }
