import { CheckCircle2, AlertCircle, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface ProcessStep {
  id: string
  no?: string               // 工序号
  name: string
  status: string
  statusText?: string       // 状态文本
  hasWarning?: boolean      // 是否有异常
  warningText?: string      // 异常描述
}

interface ProcessFlowBlockProps {
  steps: ProcessStep[]
  currentStep: number
  onClickStep?: (step: ProcessStep, index: number) => void
  compact?: boolean         // 紧凑模式
  vertical?: boolean        // 垂直模式
}

export function ProcessFlowBlock({
  steps,
  currentStep,
  onClickStep,
  compact = false,
  vertical = false
}: ProcessFlowBlockProps) {
  const size = compact ? 'w-10 h-10' : 'w-14 h-14'
  const iconSize = compact ? 'w-5 h-5' : 'w-7 h-7'

  const getStepVariant = (index: number) => {
    if (index < currentStep) return 'success'
    if (index === currentStep) return 'info'
    if (steps[index]?.hasWarning) return 'warning'
    return 'default'
  }

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed'
    if (index === currentStep) return 'in-progress'
    return 'pending'
  }

  const containerClass = vertical
    ? 'flex-col items-start gap-4 py-4'
    : 'flex items-center justify-between py-8 overflow-x-auto'

  return (
    <div className={containerClass}>
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            "flex",
            vertical ? "w-full items-start gap-4" : "items-center"
          )}
        >
          {/* 步骤内容 */}
          <div
            className={cn(
              "flex flex-col items-center",
              onClickStep && "cursor-pointer hover:opacity-80 transition-opacity",
              !vertical && "min-w-[100px]"
            )}
            onClick={() => onClickStep?.(step, index)}
          >
            {/* 图标圆圈 */}
            <div
              className={cn(
                size,
                "rounded-full flex items-center justify-center border-4 transition-all",
                getStepStatus(index) === 'completed' && "bg-green-100 border-green-500",
                getStepStatus(index) === 'in-progress' && "bg-blue-100 border-blue-500 animate-pulse",
                getStepStatus(index) === 'pending' && step.hasWarning && "bg-orange-100 border-orange-500",
                getStepStatus(index) === 'pending' && !step.hasWarning && "bg-gray-100 border-gray-300"
              )}
            >
              {getStepStatus(index) === 'completed' && (
                <CheckCircle2 className={cn(iconSize, "text-green-600")} />
              )}
              {getStepStatus(index) === 'in-progress' && (
                <AlertCircle className={cn(iconSize, "text-blue-600")} />
              )}
              {getStepStatus(index) === 'pending' && step.hasWarning && (
                <AlertTriangle className={cn(iconSize, "text-orange-600")} />
              )}
              {getStepStatus(index) === 'pending' && !step.hasWarning && (
                <Clock className={cn(iconSize, "text-gray-400")} />
              )}
            </div>

            {/* 步骤信息 */}
            <div className="mt-2 text-center">
              {step.no && (
                <div className="text-xs text-gray-500">{step.no}</div>
              )}
              <div className={cn(
                "font-medium",
                compact ? "text-sm" : "text-base"
              )}>
                {step.name}
              </div>
              {step.statusText && (
                <Badge
                  variant={getStepVariant(index) as any}
                  className="mt-1"
                  size={compact ? "sm" : "default"}
                >
                  {step.statusText}
                </Badge>
              )}
            </div>

            {/* 异常提示 */}
            {step.hasWarning && step.warningText && (
              <div className="mt-2 max-w-[150px]">
                <div className="text-xs text-orange-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="truncate">{step.warningText}</span>
                </div>
              </div>
            )}
          </div>

          {/* 连接线 */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-1 transition-all",
                vertical ? "w-1 h-8 ml-6 mt-2" : "mx-4 min-w-[40px]",
                getStepStatus(index) === 'completed' ? "bg-green-500" : "bg-gray-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// 简化版调度流程组件（仅显示步骤名称和状态）
export function SimpleProcessFlow({
  steps,
  currentStep
}: {
  steps: Array<{ name: string; status: string }>
  currentStep: number
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              index < currentStep && "bg-green-100 text-green-700",
              index === currentStep && "bg-blue-100 text-blue-700",
              index > currentStep && "bg-gray-100 text-gray-500"
            )}
          >
            {step.name}
          </div>
          {index < steps.length - 1 && (
            <span className="text-gray-400">→</span>
          )}
        </div>
      ))}
    </div>
  )
}
