import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const barVariants = cva(
  "relative border transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-background",
        outline: "border-2 border-primary",
        filled: "border-primary/20 bg-primary/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface VisualMapItem {
  data: number
  color: string
}

export interface BarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof barVariants> {
  /**
   * 当前值
   */
  value?: number
  /**
   * 最大值，默认100
   */
  maxValue?: number
  /**
   * 进度条填充颜色
   */
  color?: string
  /**
   * 边框颜色
   */
  borderColor?: string
  /**
   * 颜色映射配置
   */
  visualMap?: VisualMapItem[]
  /**
   * 方向：垂直或水平
   */
  direction?: "vertical" | "horizontal"
  /**
   * 起始位置
   */
  position?: "start" | "end"
}

const Bar = React.forwardRef<HTMLDivElement, BarProps>(
  (
    {
      className,
      value = 0,
      maxValue = 100,
      color = "#000",
      borderColor,
      visualMap = [],
      direction = "horizontal",
      position = "start",
      variant,
      ...props
    },
    ref
  ) => {
    // 计算实际值
    const computValue = React.useMemo(() => {
      return value
    }, [value])

    // 计算颜色
    const fillColor = React.useMemo(() => {
      // 如果有颜色映射，根据值查找对应颜色
      if (visualMap && visualMap.length > 0) {
        const sortedMap = [...visualMap].sort((a, b) => a.data - b.data)
        let matchedColor: string | null = null
        sortedMap.forEach((item) => {
          if (computValue >= item.data) {
            matchedColor = item.color
          }
        })
        if (matchedColor) {
          return matchedColor
        }
      }
      return color
    }, [visualMap, computValue, color])

    // 计算进度百分比
    const percentage = React.useMemo(() => {
      const val = computValue !== undefined ? computValue : 0
      return Math.min(Math.max((val / maxValue) * 100, 0), 100)
    }, [computValue, maxValue])

    // 垂直进度条样式
    if (direction === "vertical") {
      const isFromBottom = position === "start"
      const heightStyle = isFromBottom ? { bottom: 0 } : { top: 0 }

      return (
        <div
          ref={ref}
          className={cn(
            "bar-component relative w-full h-full overflow-hidden",
            barVariants({ variant }),
            className
          )}
          style={{
            borderColor: borderColor || undefined,
            ...props.style
          }}
          {...props}
        >
          <div
            className="absolute left-0 right-0 bg-current transition-all duration-300 ease-in-out"
            style={{
              ...heightStyle,
              height: `${percentage}%`,
              backgroundColor: fillColor,
              color: fillColor,
            }}
          />
        </div>
      )
    }

    // 水平进度条
    const isFromLeft = position === "start"
    const horizontalStyle = isFromLeft ? { left: 0 } : { right: 0 }

    return (
      <div
        ref={ref}
        className={cn(
          "bar-component relative w-full h-full overflow-hidden",
          barVariants({ variant }),
          className
        )}
        style={{
          borderColor: borderColor || undefined,
          ...props.style
        }}
        {...props}
      >
        <div
          className="absolute top-0 bottom-0 bg-current transition-all duration-300 ease-in-out"
          style={{
            ...horizontalStyle,
            width: `${percentage}%`,
            backgroundColor: fillColor,
            color: fillColor,
          }}
        />
      </div>
    )
  }
)
Bar.displayName = "Bar"

export { Bar, barVariants }
