import isNil from 'lodash/isNil'
import isEmpty from 'lodash/isEmpty'
import isString from 'lodash/isString'
import { MapPin } from 'lucide-react'

const Map = ({ value }: { value: any }) => {
  if (isNil(value) || isEmpty(value)) return <span className="text-muted-foreground">空</span>

  let v = value
  if (isString(value)) {
    try {
      v = JSON.parse(value)
    } catch (e) {
      // Silently ignore JSON parse errors
    }
  }

  return (
    <div className="flex items-center gap-1">
      <MapPin className="h-4 w-4 text-muted-foreground" />
      <span>
        {v?.name || ''} {v?.lng !== undefined && `(${v.lng}, ${v.lat})`}
      </span>
    </div>
  )
}

export { Map }
