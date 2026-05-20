import isNil from 'lodash/isNil'
import { CheckCircle2, XCircle } from 'lucide-react'

const BooleanIcon = ({ value }: { value: any }) => {
  if (isNil(value)) return <span className="text-muted-foreground">空</span>
  return value ? (
    <CheckCircle2 className="h-5 w-5 text-green-500" />
  ) : (
    <XCircle className="h-5 w-5 text-gray-400" />
  )
}

export { BooleanIcon }
