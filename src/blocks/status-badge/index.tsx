import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { StatusVariant } from '@/types/common'

interface StatusBadgeProps {
  status: string
  variant?: StatusVariant
  size?: 'sm' | 'md' | 'lg'
  customLabel?: string
}

// 深色工业风格状态颜色 - 高对比度
const variantClasses: Record<StatusVariant, string> = {
  default: 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
  success: 'bg-success/20 text-success border-success/50 hover:bg-success/30',
  warning: 'bg-warning/20 text-warning border-warning/50 hover:bg-warning/30',
  error: 'bg-error/20 text-error border-error/50 hover:bg-error/30',
  info: 'bg-info/20 text-info border-info/50 hover:bg-info/30',
}

const sizeClasses = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
}

export function StatusBadge({
  status,
  variant,
  size = 'md',
  customLabel
}: StatusBadgeProps) {
  // 自动推断变体
  const getVariant = (): StatusVariant => {
    if (variant) return variant

    const statusLower = status.toLowerCase()
    if (statusLower.includes('完成') || statusLower.includes('合格') || statusLower.includes('运行') || statusLower.includes('成功')) {
      return 'success'
    }
    if (statusLower.includes('进行') || statusLower.includes('生产') || statusLower.includes('已就绪') || statusLower.includes('处理中')) {
      return 'info'
    }
    if (statusLower.includes('准备') || statusLower.includes('暂停') || statusLower.includes('返修') || statusLower.includes('待')) {
      return 'warning'
    }
    if (statusLower.includes('取消') || statusLower.includes('报废') || statusLower.includes('故障') || statusLower.includes('失败')) {
      return 'error'
    }
    return 'default'
  }

  const inferredVariant = getVariant()
  const baseClass = variantClasses[inferredVariant]

  return (
    <Badge
      className={cn(
        "border font-medium transition-colors duration-200",
        baseClass,
        sizeClasses[size]
      )}
    >
      {/* 状态点 - 清晰可见 */}
      <span className={cn(
        "w-1.5 h-1.5 rounded-full shrink-0 bg-current animate-pulse",
      )} />
      {customLabel || status}
    </Badge>
  )
}
