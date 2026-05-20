import isNil from 'lodash/isNil'
import isArray from 'lodash/isArray'
import { cn } from '@/lib/utils'

const Select = ({ value, schema }: { value: any; schema?: any }) => {
  if (isNil(value)) return <span className="text-muted-foreground">空</span>

  const enumList = schema?.enum
  const enumNamesList = schema?.enumNames

  const getDisplayText = (val: any) => {
    if (enumList && enumNamesList) {
      const index = enumList.indexOf(val)
      return index >= 0 ? enumNamesList[index] : val
    }
    return val
  }

  const getColor = (val: any) => {
    const colorList = schema?.enumColor
    if (colorList && enumList) {
      const index = enumList.indexOf(val)
      return index >= 0 ? colorList[index] : undefined
    }
    return undefined
  }

  // 多选
  if (isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((item, index) => {
          const text = getDisplayText(item)
          const color = getColor(item)
          return (
            <span
              key={index}
              className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white !w-fit",
                !color && "bg-gray-500"
              )}
              style={color ? { backgroundColor: color || 'gray' } : {}}
            >
              {text}
            </span>
          )
        })}
      </div>
    )
  }

  // 单选
  const text = getDisplayText(value)
  const color = getColor(value)
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white !w-fit",
        !color && "bg-gray-500"
      )}
      style={color ? { backgroundColor: color || 'gray' } : {}}
    >
      {text}
    </span>
  )
}

export { Select }
