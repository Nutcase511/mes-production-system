import { Outlet, Link, useLocation } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useFilteredMenu } from '@/hooks/useFilteredMenu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, ListTree, Settings, ClipboardList, FileText } from 'lucide-react'

export function ProductionLayout() {
  const location = useLocation()
  const { user } = useAuth()
  const showBreadcrumb = user?.role === 'admin' || user?.isSuper === true

  // 菜单分类
  const menuCategories = [
    {
      id: 'basic',
      label: '基础管理',
      icon: <ListTree className="w-4 h-4" />,
      items: [
        { path: '/production/production-notice', label: '投产通知' },
        { path: '/production/orders', label: '生产计划' },
        { path: '/production/work-orders', label: '生产跟单' },
      ]
    },
    {
      id: 'control',
      label: '生产控制',
      icon: <Settings className="w-4 h-4" />,
      items: [
        { path: '/production/preparation-checklist', label: '准备状态检查' },
        { path: '/production/trial-production-control', label: '试生产控制' },
        { path: '/production/production', label: '正式生产' },
      ]
    },
    {
      id: 'report',
      label: '报工工时',
      icon: <ClipboardList className="w-4 h-4" />,
      items: [
        { path: '/production/work-report', label: '报工管理' },
        { path: '/production/labor-report', label: '工时报表' },
        { path: '/production/labor-standard', label: '工时定额' },
        { path: '/production/worktime', label: '工时管理' },
      ]
    },
    {
      id: 'other',
      label: '其他',
      icon: <FileText className="w-4 h-4" />,
      items: [
        { path: '/production/dispatch-rule', label: '派单规则' },
        { path: '/production/development', label: '研制生产' },
      ]
    }
  ]

  const allMenuItems = menuCategories.flatMap(cat => cat.items)
  const filteredAll = useFilteredMenu(allMenuItems)

  // 按角色过滤后的分类菜单
  const filteredCategories = menuCategories
    .map(cat => ({ ...cat, items: cat.items.filter(item => filteredAll.includes(item)) }))
    .filter(cat => cat.items.length > 0)

  const isActive = (path: string) => {
    return location.pathname === path
  }

  // 根据当前路径生成面包屑
  const getCurrentBreadcrumb = () => {
    const currentMenu = filteredAll.find(item => item.path === location.pathname)
    return [
      { label: '首页', href: '/dashboard' },
      { label: '生产管理' },
      { label: currentMenu?.label || '生产管理' }
    ]
  }

  const breadcrumbs = getCurrentBreadcrumb()

  return (
    <div className="space-y-6">
      {/* 面包屑 + 子导航菜单 集成卡片 */}
      <Card className="w-full px-4 py-3 backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{
        borderColor: 'rgba(59, 130, 246, 0.3)'
      }}>
        <div className="flex items-center justify-between gap-4">
          {/* 左侧：面包屑 - 仅管理员展示 */}
          {showBreadcrumb && <Breadcrumb className="flex-shrink-0">
            <BreadcrumbList className="text-blue-200">
              {breadcrumbs.map((crumb, index) => (
                <BreadcrumbItem key={index}>
                  {index === breadcrumbs.length - 1 ? (
                    <>
                      {index > 0 && <BreadcrumbSeparator className="text-blue-300">{'>'}</BreadcrumbSeparator>}
                      <BreadcrumbPage className="text-cyan-300 font-medium">{crumb.label}</BreadcrumbPage>
                    </>
                  ) : crumb.href ? (
                    <>
                      {index > 0 && <BreadcrumbSeparator className="text-blue-300">{'>'}</BreadcrumbSeparator>}
                      <Link to={crumb.href} className="text-blue-200 hover:text-cyan-300 transition-colors">
                        {crumb.label}
                      </Link>
                    </>
                  ) : (
                    <>
                      {index > 0 && <BreadcrumbSeparator className="text-blue-300">{'>'}</BreadcrumbSeparator>}
                      <span className="text-blue-200">{crumb.label}</span>
                    </>
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>}

          {/* 右侧：分类下拉菜单 */}
          <div className="flex items-center gap-2">
            {filteredCategories.map((category) => (
              <DropdownMenu key={category.id}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`
                      px-3 py-1.5 rounded-lg font-medium transition-all duration-300 text-sm
                      ${category.items.some(item => isActive(item.path))
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                        : 'text-blue-100 hover:bg-blue-500/10 hover:text-cyan-300'
                      }
                    `}
                  >
                    <span className="flex items-center gap-1.5">
                      {category.icon}
                      {category.label}
                      <ChevronDown className="w-3 h-3" />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 backdrop-blur-xl bg-blue-900/95 border-2 border-blue-400/30"
                >
                  {category.items.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link
                        to={item.path}
                        className={`
                          flex items-center justify-between px-3 py-2 text-sm cursor-pointer
                          ${isActive(item.path)
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                            : 'text-blue-100 hover:bg-blue-500/20'
                          }
                        `}
                      >
                        <span>{item.label}</span>
                        {isActive(item.path) && <span className="text-xs">✓</span>}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </div>
        </div>
      </Card>

      {/* 页面内容 */}
      <Outlet />
    </div>
  )
}
