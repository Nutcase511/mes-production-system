import { useLocation, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface FlowStep {
  path: string
  label: string
}

const flowGroups: Record<string, FlowStep[]> = {
  '/production': [
    { path: '/production/production-notice', label: '生产通知' },
    { path: '/production/orders', label: '订单管理' },
    { path: '/production/preparation-checklist', label: '备料检查' },
    { path: '/production/trial-production-control', label: '试产控制' },
    { path: '/production/production', label: '生产执行' },
    { path: '/production/work-orders', label: '工单管理' },
    { path: '/production/work-report', label: '工单报工' },
    { path: '/production/worktime', label: '工时管理' },
  ],
  '/quality': [
    { path: '/quality/first-check', label: '首检' },
    { path: '/quality/final-check', label: '末检' },
    { path: '/quality/final-inspection', label: '终检' },
    { path: '/quality/spc', label: 'SPC' },
    { path: '/quality/trace', label: '追溯' },
    { path: '/quality/repair', label: '返修单' },
    { path: '/quality/scrap', label: '报废单' },
  ],
  '/inventory': [
    { path: '/inventory/overview', label: '库存总览' },
    { path: '/inventory/requisition', label: '领料' },
    { path: '/inventory/product-inbound', label: '成品入库' },
    { path: '/inventory/semi-finished-inbound', label: '半成品入库' },
  ],
  '/scheduling': [
    { path: '/scheduling/routes', label: '工艺路线' },
    { path: '/scheduling/match', label: '路线匹配' },
    { path: '/scheduling/processes', label: '工序管理' },
  ],
  '/outsourcing': [
    { path: '/outsourcing/list', label: '外协列表' },
    { path: '/outsourcing/pending', label: '待处理' },
    { path: '/outsourcing/delivery', label: '发货管理' },
    { path: '/outsourcing/quality-check', label: '质量检查' },
  ],
}

export function ProductionFlowNav() {
  const location = useLocation()

  // 找到当前路径对应的流程组
  const currentPrefix = Object.keys(flowGroups).find(prefix =>
    location.pathname.startsWith(prefix)
  )

  if (!currentPrefix) return null

  const steps = flowGroups[currentPrefix]

  return (
    <div className="w-48 flex-shrink-0">
      <div className="backdrop-blur-xl bg-blue-500/10 border border-white/20 rounded-lg p-3 sticky top-0">
        <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">
          流程导航
        </h3>
        <nav className="space-y-1">
          {steps.map((step) => {
            const isActive = location.pathname === step.path
            return (
              <Link
                key={step.path}
                to={step.path}
                className={`
                  flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all duration-200
                  ${isActive
                    ? 'bg-cyan-400/20 text-cyan-300 font-medium'
                    : 'text-blue-200/70 hover:text-cyan-300 hover:bg-white/5'
                  }
                `}
              >
                {isActive && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                <span className={isActive ? '' : 'ml-5'}>{step.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
