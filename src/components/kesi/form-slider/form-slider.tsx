import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import type { BaseFormFieldProps } from "@/lib/base-form-props"

import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

const sliderVariants = cva(
  "relative",
  {
    variants: {
      variant: {
        default: "",
        outline: "",
        filled: "",
        ghost: "",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface SliderProps
  extends Omit<BaseFormFieldProps, 'value' | 'onChange' | 'onBlur' | 'name' | 'ref' | 'id' | 'schema' | 'record'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">,
    VariantProps<typeof sliderVariants> {
  /**
   * 当前值
   */
  value?: number | number[]
  /**
   * 默认值
   */
  defaultValue?: number | number[]
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 是否只读
   */
  readOnly?: boolean
  /**
   * 最小值
   */
  min?: number
  /**
   * 最大值
   */
  max?: number
  /**
   * 步长
   */
  step?: number
  /**
   * 双滑块模式（范围选择）
   */
  range?: boolean
  /**
   * 拖拽到刻度上
   */
  dots?: boolean
  /**
   * 刻度标记
   */
  marks?: Array<{ number: number; label: string }>
  /**
   * 垂直方向
   */
  vertical?: boolean
  /**
   * 反向坐标轴
   */
  reverse?: boolean
  /**
   * 值变化回调
   */
  onChange?: (value: number | number[]) => void
  /**
   * 拖拽结束回调
   */
  onAfterChange?: (value: number | number[]) => void
}

const FormSlider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      className,
      value: controlledValue,
      defaultValue = 10,
      disabled = false,
      readOnly = false,
      min = 0,
      max = 100,
      step = 1,
      range = false,
      dots = false,
      marks,
      vertical = false,
      reverse = false,
      onChange,
      onAfterChange,
      variant,
      ...props
    },
    ref
  ) => {
    // 确定默认值 - 兼容dashboard的逻辑
    const getDefaultValue = React.useCallback(() => {
      if (range) {
        // 范围模式：确保是数组，类似dashboard的逻辑
        if (Array.isArray(defaultValue)) {
          return defaultValue.length >= 2 ? defaultValue : [min, max]
        }
        return [min, max]
      } else {
        // 单值模式：确保是单个数字
        if (Array.isArray(defaultValue)) {
          return [defaultValue[0] ?? min]
        }
        return [typeof defaultValue === 'number' ? defaultValue : min]
      }
    }, [defaultValue, range, min, max])

    const [internalValue, setInternalValue] = React.useState<number[]>(
      getDefaultValue()
    )

    const isControlled = controlledValue !== undefined
    const currentValue = isControlled
      ? (Array.isArray(controlledValue) ? controlledValue : [controlledValue])
      : internalValue

    // 处理值变化
    const handleValueChange = React.useCallback(
      (newValue: number[]) => {
        if (readOnly) return

        if (!isControlled) {
          setInternalValue(newValue)
        }

        // 根据range模式返回不同格式的值，兼容dashboard
        onChange?.(range ? newValue : newValue[0])
      },
      [isControlled, range, readOnly, onChange]
    )

    // 处理拖拽结束
    const handleValueCommit = React.useCallback(
      (newValue: number[]) => {
        // 根据range模式返回不同格式的值
        onAfterChange?.(range ? newValue : newValue[0])
      },
      [range, onAfterChange]
    )

    // 处理marks - 计算每个刻度的位置百分比
    const processedMarks = React.useMemo(() => {
      if (!marks || marks.length === 0) return undefined

      const range = max - min
      return marks.map(mark => {
        const position = ((mark.number - min) / range) * 100
        return {
          value: mark.number,
          label: mark.label,
          position: Math.max(0, Math.min(100, position)) // 限制在 0-100 之间
        }
      }).sort((a, b) => a.value - b.value)
    }, [marks, min, max])

    return (
      <div
        ref={ref}
        className={cn(
          sliderVariants({ variant }),
          className
        )}
        {...props}
      >
        <Slider
          {...(isControlled ? { value: currentValue } : { defaultValue: getDefaultValue() })}
          onValueChange={handleValueChange}
          onValueCommit={handleValueCommit}
          disabled={disabled || readOnly}
          min={min}
          max={max}
          step={step}
          orientation={vertical ? "vertical" : "horizontal"}
          inverted={reverse}
          key={'slider-' + (range ? 'range' : 'single')}
        />
        {processedMarks && (
          <div >
            {processedMarks.map((mark) => (
              <div
                key={mark.value}
              >
                {mark.label}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

FormSlider.displayName = "FormSlider"

export { FormSlider }
