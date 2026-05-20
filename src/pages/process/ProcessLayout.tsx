import { Outlet, Link, useLocation } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { useAuth } from '@/contexts/AuthContext'
import { useFilteredMenu } from '@/hooks/useFilteredMenu'

export function ProcessLayout() {
  const location = useLocation()
  const { user } = useAuth()
  const showBreadcrumb = user?.role === 'admin' || user?.isSuper === true

  const menuItems = [
    { path: '/scheduling/routes', label: '调度路线' },
    { path: '/scheduling/match', label: '调度匹配' },
    { path: '/scheduling/processes', label: '调度规程' },
  ]

  const filteredMenu = useFilteredMenu(menuItems)

  const isActive = (path: string) => {
    return location.pathname === path
  }

  // 根据当前路径生成面包屑
  const getCurrentBreadcrumb = () => {
    const currentMenu = filteredMenu.find(item => item.path === location.pathname)
    return [
      { label: '首页', href: '/dashboard' },
      { label: '调度管理' },
      { label: currentMenu?.label || '调度管理' }
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

          {/* 右侧：菜单按钮 */}
          <div className="flex gap-1">
            {filteredMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm whitespace-nowrap
                  ${isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                    : 'text-blue-100 hover:bg-blue-500/10 hover:text-cyan-300'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </Card>

      {/* 页面内容 */}
      <Outlet />
    </div>
  )
}
