import has from 'lodash/has'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { cn } from '@/lib/utils'

interface FilterTextBooleanProps {
  field: { key: string }
  input: {
    value: any
    onChange: (value: any) => void
  }
}

const FilterTextBoolean = ({ field, input: { value, onChange } }: FilterTextBooleanProps) => {
  const options = [
    { label: '全部', value: '1' },
    { label: '为空', value: '2' },
    { label: '不为空', value: '3' }
  ]

  const onRadio = (selectedValue: string) => {
    switch (selectedValue) {
      case '1':
        onChange(null)
        break
      case '2':
        onChange({ '$or': [{ [field.key]: null }, { [field.key]: '' }] })
        break
      case '3':
        onChange({ '$and': [{ [field.key]: { '$ne': null } }, { [field.key]: { '$ne': '' } }] })
        break
      default:
        break
    }
  }

  let radioValue = '1'

  if (has(value, '$or')) {
    radioValue = '2'
  } else if (has(value, '$and')) {
    radioValue = '3'
  }

  return (
    <ButtonGroup className="min-w-50">
      {options.map((option) => (
        <Button
          key={option.value}
          variant={radioValue === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onRadio(option.value)}
          className={cn(
            'flex-1',
            radioValue === option.value && 'z-10'
          )}
        >
          {option.label}
        </Button>
      ))}
    </ButtonGroup>
  )
}

FilterTextBoolean.displayName = 'FilterTextBoolean'

export { FilterTextBoolean }
