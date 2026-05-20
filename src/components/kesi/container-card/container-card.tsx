import * as React from "react"
import { cn } from "@/lib/utils"
import { Card as ShadcnCard, CardHeader, CardTitle } from "@/components/ui/card"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  cardTitle?: string
  children?: React.ReactNode
  className?: string
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      cardTitle = '',
      children,
      ...props
    },
    ref
  ) => {
    // 处理标题
    const title = React.useMemo(() => {
      if (typeof cardTitle === 'string') {
        return cardTitle
      }
      try {
        return JSON.stringify(cardTitle)
      } catch {
        return '标题'
      }
    }, [cardTitle])

    return (
      <ShadcnCard
        ref={ref}
        className={cn("dashboard-container-card w-full max-w-sm", className)}
        {...props}
      >
        {title && <CardHeader><CardTitle>{title}</CardTitle></CardHeader>}
        {children}
      </ShadcnCard>
    )
  }
)

Card.displayName = "Card"

export { Card }
