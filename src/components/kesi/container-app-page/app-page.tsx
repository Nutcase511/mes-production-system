import * as React from "react"
import { cn } from "@/lib/utils"

export interface AppPageProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const AppPage = React.forwardRef<HTMLDivElement, AppPageProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("app-page w-full h-full", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

AppPage.displayName = "AppPage"

export { AppPage }
