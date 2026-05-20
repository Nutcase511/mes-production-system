import React from 'react'

import { Target } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const useTextFilter = (props: any) => {
  
  let value = props.value
  let like: boolean | null = null

  if (value == null || value == undefined || value == '') {
    value = ''
    like = true
  } else if (value && value.like !== undefined) {
    value = value.like
    like = true
  } else {
    like = false
  }

  const onChange = ({ value, like }: { value: any; like: boolean }) => {
    if (like) {
      props.onChange(value !== undefined ? { like: value } : value)
    } else {
      props.onChange(value)
    }
  }

  const onValueChange = (value: any) => {
    if (like && value) {
      props.onChange({ like: value })
    } else {
      props.onChange(value)
    }
  }

  const onLikeChange = (like: boolean) => {
    if (like) {
      props.onChange({ like: value })
    } else {
      props.onChange(value)
    }
  }

  const onKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
    }
  }

  const clear = () => onValueChange(null)

  const changeModeBtn = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'cursor-pointer transition-colors',
              !like ? 'text-green-600' : 'text-muted-foreground'
            )}
            onClick={() => onLikeChange(!like)}
          >
            {(value == null || value == undefined || value == '') ? null : <Target className="h-4 w-4" />}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>精确搜索</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return { like, value, onChange, onValueChange, onLikeChange, onKeyPress, clear, changeModeBtn }
}

const TextFilter = (props: any) => {
  const { value, changeModeBtn, onValueChange, onKeyPress } = useTextFilter(props.input || props)
  const { label } = props

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onValueChange(e.target.value || undefined)}
        onKeyDown={onKeyPress}
        placeholder={label}
        className="pr-8"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        {changeModeBtn}
      </div>
    </div>
  )
}

const SearchTextFilter = (props: any) => {
  const input = props.input || props
  const { name, onBlur, onChange, ...inputProps } = input
  const { onSubmit, label, field } = props
  const { value, changeModeBtn, onValueChange } = useTextFilter(input)
  const [searchValue, setSearchValue] = React.useState(value)

  React.useEffect(() => {
    setSearchValue(value)
  }, [value])

  const handleSearch = () => {
    onValueChange(searchValue)
    onSubmit && onSubmit()
  }

  return (
    <div className="relative">
      <Input
        {...inputProps}
        {...field?.attrs}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch()
          }
        }}
        placeholder={`Search ${label || ''}`}
        className="pr-16"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {changeModeBtn}
        <button
          type="button"
          onClick={handleSearch}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      </div>
    </div>
  )
}

const SubmitOnChangeWrap = ({ value: propsValue, onChange: propsOnChange, ...restProps }: any) => {
  const [state, setState] = React.useState({ value: propsValue ?? '', typing: false })

  React.useEffect(() => {
    if (!state.typing) {
      setState({ value: propsValue ?? '', typing: false })
    }
  }, [propsValue])

  const onSubmit = () => {
    propsOnChange(state.value)
    setState({ ...state, typing: false })
  }

  const onChange = (value: any) => setState({ value, typing: true })

  return <SearchTextFilter input={{ ...restProps, onChange: onChange, value: state.value }} {...restProps} onSubmit={onSubmit} />
}

const FilterText = ({ option, ...props }: any) => {
  const submitOnChange = option && option.options && option.options.submitOnChange

  return submitOnChange
    ? <SubmitOnChangeWrap {...props} />
    : <TextFilter {...props} />
}

FilterText.displayName = "FilterText"
export { FilterText }