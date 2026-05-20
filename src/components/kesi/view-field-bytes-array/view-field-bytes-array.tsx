import isNil from 'lodash/isNil'

const BytesArray = ({ value }: { value: any }) => {
  if (isNil(value)) return <span className="text-muted-foreground">空</span>
  return <span className="font-mono text-xs">{value}</span>
}

export { BytesArray }
