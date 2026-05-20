import isNil from 'lodash/isNil'

const SerialNumber = ({ value }: { value: any }) => {
  if (isNil(value)) return <span className="text-muted-foreground">空</span>
  return <span className="font-mono">{value}</span>
}

export { SerialNumber }
