import isNil from 'lodash/isNil'
import { cn } from '@/lib/utils'

const Rate = ({ value, schema }: { value: any; schema?: any }) => {
  if (isNil(value)) return <span className="text-muted-foreground">空</span>
  const max = schema?.max || 5
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "text-lg",
            i < value ? "text-yellow-400" : "text-gray-300"
          )}
        >
          ★
        </span>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">({value})</span>
    </div>
  )
}

export { Rate }
