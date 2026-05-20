import isNil from 'lodash/isNil'
import { Link2 } from 'lucide-react'

const Link = ({ value, schema }: { value: any; schema?: any }) => {
  if (isNil(value)) return <span className="text-muted-foreground">空</span>

  const handleClick = () => {
    if (schema?.linkType === 'in') {
      // 内部跳转
    } else {
      window.open(value, '_blank')
    }
  }

  return (
    <a
      href="javascript:void(0);"
      onClick={handleClick}
      className="flex items-center gap-1 text-blue-600 hover:underline"
    >
      <Link2 className="h-4 w-4" />
      {value}
    </a>
  )
}

export { Link }
