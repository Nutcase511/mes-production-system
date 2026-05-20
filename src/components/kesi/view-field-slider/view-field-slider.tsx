import isNil from 'lodash/isNil'

const Slider = ({ value }: { value: any; schema?: any }) => {
  if (isNil(value)) return <span className="text-muted-foreground">空</span>
  return <span>{value}</span>
}

export { Slider }
