import isNil from 'lodash/isNil'
import isArray from 'lodash/isArray'

const UserRole = ({ value }: { value: any }) => {
  if (isNil(value)) return <span className="text-muted-foreground">空</span>

  if (isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((item: any, index: number) => (
          <span
            key={index}
            className="inline-block border rounded px-2 py-0.5 text-xs"
          >
            {item?.name || item}
          </span>
        ))}
      </div>
    )
  }

  return <span>{value?.name || value}</span>
}

export { UserRole }
