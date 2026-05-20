import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

export interface PanelConfig {
  /**
   * 面板标题
   */
  title: string
  /**
   * 强制渲染（即使未展开也渲染 DOM）
   */
  forceRender?: boolean
}

export interface PanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  /**
   * 是否手风琴模式（只允许一个面板展开）
   * @default true
   */
  accordion?: boolean
  /**
   * 是否允许全部折叠（仅在手风琴模式下有效）
   * @default false
   */
  collapsible?: boolean
  /**
   * 面板配置数组
   */
  panels?: PanelConfig[]
  /**
   * 默认展开的面板索引（从 0 开始）
   * 手风琴模式：单个数字，多开模式：数字数组
   * @default 0
   */
  defaultValue?: number | number[]
  /**
   * 受控模式：当前展开的面板索引
   */
  value?: string | string[]
  /**
   * 展开状态变化回调
   */
  onValueChange?: (value: string | string[]) => void
  /**
   * 子元素（如果提供 panels，则忽略 children）
   */
  children?: React.ReactNode
}

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      className,
      accordion = true,
      collapsible = false,
      panels,
      defaultValue = '0',
      value,
      onValueChange,
      children,
      ...props
    },
    ref
  ) => {
    // 计算默认值
    const getDefaultValue = () => {
      if (accordion) {
        // 手风琴模式：单个值
        if (typeof defaultValue === "number") {
          return `panel-${defaultValue}`
        }
        if (Array.isArray(defaultValue) && defaultValue.length > 0) {
          // 取第一个作为默认展开
          return `panel-${defaultValue[0]}`
        }
        return `panel-0`
      } else {
        // 多开模式：数组
        if (Array.isArray(defaultValue)) {
          return defaultValue.map((i) => `panel-${i}`)
        }
        if (typeof defaultValue === "number") {
          return [`panel-${defaultValue}`]
        }
        return [`panel-0`]
      }
    }

    // 渲染配置模式的面板
    const renderConfigPanels = () => {
      if (!panels || panels.length === 0) {
        return null
      }

      const childrenArray = React.Children.toArray(children)

      return panels.map((panel, index) => {
        const panelValue = `panel-${index}`
        return (
          <AccordionItem key={panelValue} value={panelValue}>
            <AccordionTrigger>{panel.title || `面板 ${index + 1}`}</AccordionTrigger>
            <AccordionContent
              forceMount={panel.forceRender ? true : undefined}
            >
              {childrenArray[index] || (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <p>面板内容区域 {index + 1}</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )
      })
    }

    // 渲染 children 模式的面板
    const renderChildrenPanels = () => {
      return children
    }

    return (
      <div
        ref={ref}
        className={cn("panel-container", className)}
        {...props}
      >
        {accordion ? (
          <Accordion
            type="single"
            collapsible={collapsible || undefined}
            defaultValue={getDefaultValue() as string | undefined}
            value={typeof value === "string" ? value : undefined}
            onValueChange={onValueChange}
            className="w-full"
          >
            {panels && panels.length > 0 ? renderConfigPanels() : renderChildrenPanels()}
          </Accordion>
        ) : (
          <Accordion
            type="multiple"
            defaultValue={getDefaultValue() as string[] | undefined}
            value={Array.isArray(value) ? value : undefined}
            onValueChange={onValueChange}
            className="w-full"
          >
            {panels && panels.length > 0 ? renderConfigPanels() : renderChildrenPanels()}
          </Accordion>
        )}
      </div>
    )
  }
)

Panel.displayName = "Panel"

export { Panel }
