import * as React from "react"
import dayjs from "dayjs"
import isNil from 'lodash/isNil'
import isEmpty from 'lodash/isEmpty'
import isString from 'lodash/isString'
import isNull from 'lodash/isNull'
import isNumber from 'lodash/isNumber'
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { convertValue, valueFormat, type DataPointConfig } from "@/lib/data-point-utils"
import { useUser, useTag } from "@airiot/client"

export interface WarningState {
  className?: string
  level?: '低' | '中' | '高'
  recoveryTime?: string
}

export interface TimeoutState {
  isTimeout?: boolean
  isOffline?: boolean
}

export interface DataPointTag {
  value: any
  time?: string | Date
  warningState?: WarningState
  timeoutState?: TimeoutState
}

export interface DataPointProps {
  tableId: string
  tableDataId: string
  tableDataName?: string
  tagId: string
  initVisible?: boolean
  format?: (value: any) => any
  colors?: {
    timeout?: string
    offline?: string
    warning?: string
    warning1?: string
    warning2?: string
    warning3?: string
    warning4?: string
  }
  animated?: boolean
  timeoutColor?: string
  offlineColor?: string
  warningColor?: string
  warningLevelColor?: {
    '低'?: string
    '中'?: string
    '高'?: string
  }
  tagClassName?: string
  config?: DataPointConfig
}

export interface DataPointValueProps {
  value: any
  format?: (value: any) => any
  config: DataPointConfig
}

export interface PopoverContentProps {
  setVisible: (visible: boolean) => void
  value: any
  time?: string | Date
  warningState?: WarningState
  config: DataPointConfig
  format?: (value: any) => any
  colors?: {
    timeout?: string
    offline?: string
    warning?: string
    warning1?: string
    warning2?: string
    warning3?: string
    warning4?: string
  }
  animated?: boolean
  timeoutColor?: string
  offlineColor?: string
  warningColor?: string
  warningLevelColor?: {
    '低'?: string
    '中'?: string
    '高'?: string
  }
  tagClassName?: string
  tagName?: string
  tableId: string
  tableDataId: string
  tableDataName?: string
  tagId: string
  initVisible?: boolean
}

// Animated Number Component
const AnimatedNumber: React.FC<{
  value: number
  className?: string
}> = ({ value, className }) => {
  const [displayValue, setDisplayValue] = React.useState(0)

  React.useEffect(() => {
    const duration = 300
    const steps = 30
    const increment = (value - displayValue) / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      if (currentStep >= steps) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(prev => prev + increment)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return <span className={className}>{displayValue}</span>
}

// Gap Time Component
const GapTime: React.FC<{ seconds: number }> = ({ seconds }) => {
  let text = ''
  let ss = seconds < 0 && seconds > -5 ? 0 : seconds
  let rt = ss

  if (rt > 24 * 3600) {
    text += `${Math.floor(rt / (24 * 3600))}天`
    rt = rt % (24 * 3600)
  }
  if (text != '' || rt > 3600) {
    text += ` ${Math.floor(rt / 3600)}小时`
    rt = rt % 3600
  }
  if (text != '' || rt > 60) {
    text += ` ${Math.floor(rt / 60)}分`
    rt = rt % 60
  }
  text += ` ${rt}秒`

  return (
    <span title={`${ss}秒`}>
      {text}
    </span>
  )
}

// Latest Value Component
const LatestValue: React.FC<{
  value: any
  format?: (value: any) => any
  config: DataPointConfig
}> = ({ value, format, config }) => {
  const [state, setState] = React.useState<any>(null)

  React.useEffect(() => {
    if (!isNil(value)) {
      setState(value)
    }
  }, [value])

  const val = convertValue(state, format, config)

  return (
    <p>
      <strong>最新有效值: </strong>
      {!isNil(val) ? val : null}
    </p>
  )
}

// Popover Content Component
const PopoverContentComponent: React.FC<PopoverContentProps> = ({
  setVisible,
  value,
  time,
  warningState,
  config,
  format,
}) => {
  const { interval } = config
  // Mock server time - in real implementation this would come from a context or prop
  const serverTime = dayjs()
  const gap = time ? serverTime.unix() - dayjs(time).unix() : 0

  const valid = time ? !dayjs(time).isValid() : true

  return (
    <div className="space-y-2">
      <LatestValue
        value={value}
        format={format}
        config={config}
      />
      <p>
        <strong>最新时间: </strong>
        {!valid && time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : null}
      </p>
      <p>
        <strong>距现时间: </strong>
        {!valid && time ? <GapTime seconds={gap} /> : null}
      </p>
      {interval ? (
        <p>
          <strong>采集周期: </strong>
          {interval}秒
        </p>
      ) : null}
      {warningState && !isEmpty(warningState) ? (
        <div className="text-sm">
          Warning State: {JSON.stringify(warningState)}
        </div>
      ) : null}
      {!isString(value) && (
        <p className="text-center">
          <button
            onClick={() => setVisible(false)}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            查看历史数据
          </button>
        </p>
      )}
    </div>
  )
}

// Default Render Component
const DefaultRender: React.FC<{
  tag: DataPointTag
  config: DataPointConfig
  format?: (value: any) => any
  animated?: boolean
  timeoutColor?: string
  offlineColor?: string
  warningColor?: string
  warningLevelColor?: { '低'?: string; '中'?: string; '高'?: string }
  tagClassName?: string
  colors?: {
    timeout?: string
    offline?: string
    warning1?: string
    warning2?: string
    warning3?: string
    warning4?: string
    [key: string]: string | undefined
  }
}> = ({
  tag,
  config,
  format,
  animated,
  timeoutColor,
  offlineColor,
  warningColor,
  warningLevelColor,
  tagClassName = '',
  colors
}) => {
    const { errview } = config || {}
    const { value, warningState = {}, timeoutState = {} } = tag || {}

    const val = convertValue(value, format, config)

    const { className: warningClassName, level, recoveryTime } = warningState
    const { isTimeout, isOffline } = timeoutState

    const _timeoutColor = isTimeout ? timeoutColor || colors?.timeout : undefined
    const backgroundColor = isOffline
      ? offlineColor || colors?.offline
      : _timeoutColor

    const tagStyle: React.CSSProperties = {
      cursor: 'pointer',
      ...(backgroundColor && { backgroundColor }),
      userSelect: 'none',
    }

    if (level) {
      const k: Record<string, string> = { '低': 'warning1', '中': 'warning2', '高': 'warning3' }
      tagStyle.color = warningLevelColor?.[level] || warningColor || colors?.[k[level] as keyof typeof colors]
    }

    if (recoveryTime) {
      tagStyle.color = colors?.['warning4']
    }

    return (
      <span
        className={cn(
          warningClassName || 'normal',
          tagClassName,
          'inline-flex items-center'
        )}
        style={tagStyle}
      >
        {(isTimeout && (errview == '不显示当前值' || !errview)) ? (
          <span className="text-muted-foreground">-</span>
        ) : val == 0 ? (
          val
        ) : val === undefined || value === '' || isNull(val) ? (
          <span className="text-muted-foreground">-</span>
        ) : (
          <>{animated && isNumber(val) ? <AnimatedNumber value={val} /> : val}</>
        )}
      </span>
    )
  }

// Main DataPoint Component
const DataPoint = React.forwardRef<HTMLSpanElement, DataPointProps>(
  (
    {
      tableId,
      tableDataId,
      tableDataName,
      tagId,
      initVisible,
      format,
      colors,
      animated,
      timeoutColor,
      offlineColor,
      warningColor,
      warningLevelColor,
      tagClassName = '',
      config = {} as DataPointConfig,
    },
    _ref
  ) => {
    const [visible, setVisible] = React.useState(initVisible || false)
    const { user } = useUser()

    // 检查用户是否登录
    const isLoggedIn = user && (user.token || user.username || user.id)

    // Use useDataTag to get real-time data point data and configuration
    // 只有在登录时才使用 useDataTag
    const tagValue = useTag({
      tableId,
      dataId: tableDataId,
      tagId,
    })

    // Extract tag data from useDataTag response
    const tag: DataPointTag = React.useMemo(() => ({
      value: tagValue?.value,
      time: tagValue?.time,
      warningState: tagValue?.warningState || {},
      timeoutState: tagValue?.timeoutState || {},
    }), [tagValue])

    const renderProps = {
      tag,
      config,
      format,
      animated,
      timeoutColor,
      offlineColor,
      warningColor,
      warningLevelColor,
      tagClassName,
      colors,
    }

    const contentProps: PopoverContentProps = {
      setVisible,
      format,
      value: tag.value,
      time: tag.time,
      warningState: tag.warningState,
      config,
      tableId,
      tableDataId,
      tableDataName,
      tagId,
      tagName: config?.tagValue?.enum?.[0]?.label || tagId,
      animated,
      timeoutColor,
      offlineColor,
      warningColor,
      warningLevelColor,
      tagClassName,
      colors,
      initVisible,
    }

    const number = <DefaultRender {...renderProps} />

    // 如果未登录，显示提示
    if (!isLoggedIn) {
      return (
        <div>
          <span className="text-slate-400">请先登录以查看数据点</span>
        </div>
      )
    }

    return (
      <Popover open={visible} onOpenChange={setVisible}>
        <PopoverTrigger asChild>
          <span ref={_ref} className="inline-block cursor-pointer">
            {number}
          </span>
        </PopoverTrigger>
        <PopoverContent className="z-999" side="bottom" align="start">
          <div className="font-medium mb-2">{tableDataName}</div>
          <PopoverContentComponent {...contentProps} />
        </PopoverContent>
      </Popover>
    )
  }
)

DataPoint.displayName = "DataPoint"

export { DataPoint, convertValue, valueFormat, AnimatedNumber }
export type { DataPointConfig } from "../../lib/data-point-utils"
