import isString from 'lodash/isString'
import isNumber from 'lodash/isNumber'
import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const Formula = ({ value }: { value: any }) => {
  if (isString(value) || isNumber(value)) {
    return <span>{value}</span>
  } else if (isArray(value) && (isString(value[0]) || isNumber(value[0]))) {
    return <span>{value.join(',')}</span>
  } else if (isArray(value) || isObject(value)) {
    let str = JSON.stringify(value)
    if (str.length > 50) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">{str.substring(0, 50)}...</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-md break-word">{str}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
    return <span>{str}</span>
  }
  return <span></span>
}

export { Formula }
