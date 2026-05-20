/**
 * 服务模块布局组件
 */

import { Outlet } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link, useLocation } from 'react-router-dom'
import {
  FileText,
  Database,
  FileCheck,
  Wrench
} from 'lucide-react'

export function ServiceLayout() {
  const location = useLocation()
  const currentPath = location.pathname

  const tabs = [
    { path: '/service/customer-asset-transfer', label: '顾客资产移交', icon: FileText },
    { path: '/service/customer-asset-ledger', label: '顾客资产台账', icon: Database },
    { path: '/service/product-handover', label: '产品交接单', icon: FileCheck },
    { path: '/service/field-service', label: '现场服务记录', icon: Wrench }
  ]

  return (
    <div className="space-y-4">
      {/* 导航标签 */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl"
        style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <CardContent className="p-4">
          <Tabs value={currentPath}>
            <TabsList className="bg-blue-500/20">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.path}
                  value={tab.path}
                  className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-white"
                  asChild
                >
                  <Link to={tab.path}>
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* 子页面内容 */}
      <Outlet />
    </div>
  )
}

export default ServiceLayout