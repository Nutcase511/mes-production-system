import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Tabs as ShadcnTabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"

export interface TabConfig {
  /**
   * 标签标题
   */
  title: string
  /**
   * 标签图标 URL
   */
  icon?: string
  /**
   * 选中状态的图标 URL
   */
  selectedIcon?: string
  /**
   * 强制渲染（即使未展开也渲染 DOM）
   */
  forceRender?: boolean
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 标签配置数组
   */
  tabs: TabConfig[]
  /**
   * 默认激活的标签索引（从 0 开始）
   * @default 0
   */
  defaultValue?: string
  /**
   * 受控模式：当前激活的标签值
   */
  value?: string
  /**
   * 激活状态变化回调
   */
  onValueChange?: (value: string) => void
  /**
   * 标签位置
   * @default 'top'
   */
  orientation?: 'top' | 'bottom' | 'left' | 'right'
  /**
   * 标签样式
   * @default 'line'
   */
  variant?: 'line' | 'card'
  /**
   * 隐藏时销毁未激活的标签内容
   * @default false
   */
  destroyInactiveTabPane?: boolean
  /**
   * 子元素
   */
  children?: React.ReactNode
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      className,
      tabs = [],
      defaultValue = "tab-0",
      value,
      onValueChange,
      orientation = "top",
      variant = "line",
      destroyInactiveTabPane = false,
      children,
      ...props
    },
    ref
  ) => {
    const childrenArray = React.Children.toArray(children)

    // 渲染标签触发器
    const renderTriggers = () => {
      return tabs.map((tab, index) => {
        const tabValue = `tab-${index}`
        const iconUrl = value === tabValue && tab.selectedIcon ? tab.selectedIcon : tab.icon

        return (
          <TabsTrigger
            key={tabValue}
            value={tabValue}
            className={cn(
              "gap-2",
              variant === "card" && "data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary"
            )}
          >
            {iconUrl && (
              <img
                src={iconUrl}
                alt=""
                style={{ width: 14, height: 14 }}
              />
            )}
            {tab.title || `Tab ${index + 1}`}
          </TabsTrigger>
        )
      })
    }

    // 渲染标签内容
    const renderContents = () => {
      return tabs.map((tab, index) => {
        const tabValue = `tab-${index}`

        return (
          <TabsContent
            key={tabValue}
            value={tabValue}
            forceMount={tab.forceRender ? true : undefined}
            className={cn(
              "mt-0 flex-1",
              orientation === "left" || orientation === "right" ? "ml-0" : ""
            )}
          >
            {childrenArray[index] || (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>标签内容区域 {index + 1}</p>
              </div>
            )}
          </TabsContent>
        )
      })
    }

    // 获取 Radix UI 的 orientation
    const getRadixOrientation = (): "horizontal" | "vertical" => {
      return orientation === "left" || orientation === "right" ? "vertical" : "horizontal"
    }

    // 获取容器布局类
    const getContainerClass = () => {
      switch (orientation) {
        case "left":
          return "flex flex-row"
        case "right":
          return "flex flex-row-reverse"
        case "bottom":
          return "flex flex-col-reverse"
        default:
          return "flex flex-col"
      }
    }

    // 获取 TabsList 样式
    const getTabsListClass = () => {
      const baseClasses = "justify-start"

      if (orientation === "left" || orientation === "right") {
        return cn(
          baseClasses,
          "flex-col items-stretch h-full w-auto min-w-[120px] border-r"
        )
      }

      if (orientation === "bottom") {
        return cn(
          baseClasses,
          "flex-row w-full border-t"
        )
      }

      // top
      return cn(
        baseClasses,
        "flex-row w-full border-b"
      )
    }

    return (
      <div
        ref={ref}
        className={cn("tabs-container w-full h-full", className)}
        {...props}
      >
        <ShadcnTabs
          defaultValue={defaultValue}
          value={value}
          onValueChange={onValueChange}
          orientation={getRadixOrientation()}
          className={cn(getContainerClass())}
        >
          <TabsList
            className={cn(
              getTabsListClass(),
              variant === "card" && "bg-muted/50 p-1 m-0 border-0"
            )}
          >
            {renderTriggers()}
          </TabsList>
          {renderContents()}
        </ShadcnTabs>
      </div>
    )
  }
)

Tabs.displayName = "Tabs"

export { Tabs }
