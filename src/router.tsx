import { createBrowserRouter, Navigate, Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { Dashboard2Page } from './pages/dashboard/Dashboard2Page'
import { ProductionLinePage } from './pages/dashboard/ProductionLinePage'
import { IoTPage } from './pages/dashboard/IoTPage'
import { FactoryDataPage } from './pages/dashboard/FactoryDataPage'
import { EquipmentStatusPage } from './pages/dashboard/EquipmentStatusPage'
import { ProductionNoticePage } from './pages/production/ProductionNoticePage'
import { OrderListPage } from './pages/production/OrderListPage'
import { PreparationChecklistPage } from './pages/production/PreparationChecklistPage'
import { TrialProductionControlPage } from './pages/production/TrialProductionControlPage'
import { ProductionPage } from './pages/production/ProductionPage'
import { WorkOrderPage } from './pages/production/WorkOrderPage'
import { WorkTimePage } from './pages/production/WorkTimePage'
import { DevelopmentPage } from './pages/production/DevelopmentPage'
import { WorkReportPage } from './pages/production/WorkReportPage'
import { SchedulingPage } from './pages/production/SchedulingPage'
import { LaborStandardPage } from './pages/production/LaborStandardPage'
import { LaborReportPage } from './pages/production/LaborReportPage'
import { ProductionLayout } from './pages/production/ProductionLayout'
import { DowngradeUsePage } from './pages/production/DowngradeUsePage'
import { FirstCheckPage } from './pages/quality/FirstCheckPage'
import { FinalCheckPage } from './pages/quality/FinalCheckPage'
import { FinalInspectionPage } from './pages/quality/FinalInspectionPage'
import { SPCPage } from './pages/quality/SPCPage'
import { TracePage } from './pages/quality/TracePage'
import { RepairOrderPage } from './pages/quality/RepairOrderPage'
import { ScrapOrderPage } from './pages/quality/ScrapOrderPage'
import { QualityLayout } from './pages/quality/QualityLayout'
import { NonconformingReviewPage } from './pages/quality/NonconformingReviewPage'
import { TestPreparationCheckPage } from './pages/quality/TestPreparationCheckPage'
import { TestEnvironmentRecordPage } from './pages/quality/TestEnvironmentRecordPage'
import { EmergencyReleasePage } from './pages/quality/EmergencyReleasePage'
import { InspectionStampPage } from './pages/quality/InspectionStampPage'
import { InventoryPage } from './pages/inventory/InventoryPage'
import { MaterialRequisitionPage } from './pages/inventory/MaterialRequisitionPage'
import { ProductInboundPage } from './pages/inventory/ProductInboundPage'
import { SemiFinishedInboundPage } from './pages/inventory/SemiFinishedInboundPage'
import { PurchaseOrderPage } from './pages/inventory/PurchaseOrderPage'
import { InventoryDetailPage } from './pages/inventory/InventoryDetailPage'
import { InventoryTransactionPage } from './pages/inventory/InventoryTransactionPage'
import { InventoryLocationPage } from './pages/inventory/InventoryLocationPage'
import { WarehouseTransferPage } from './pages/inventory/WarehouseTransferPage'
import { InventoryLayout } from './pages/inventory/InventoryLayout'
import { EquipmentMonitorPage } from './pages/equipment/EquipmentMonitorPage'
import { EquipmentDetailPage } from './pages/equipment/EquipmentDetailPage'
import { EquipmentListPage } from './pages/equipment/EquipmentListPage'
import { MaintenancePage } from './pages/equipment/MaintenancePage'
import { InspectionPage } from './pages/equipment/InspectionPage'
import { GaugeInspectionPage } from './pages/equipment/GaugeInspectionPage'
import { ToolMaintenancePage } from './pages/equipment/ToolMaintenancePage'
import { EquipmentLayout } from './pages/equipment/EquipmentLayout'
import ImportEquipmentPage from './pages/equipment/ImportEquipmentPage'
import { RouteListPage } from './pages/process/RouteListPage'
import { RouteMatchPage } from './pages/process/RouteMatchPage'
import { ProcessListPage } from './pages/process/ProcessListPage'
import { ProcessLayout } from './pages/process/ProcessLayout'
import { OutsourcingLayout } from './pages/outsourcing/OutsourcingLayout'
import { OutsourcingListPage } from './pages/outsourcing/OutsourcingListPage'
import { OutsourcingPendingPage } from './pages/outsourcing/OutsourcingPendingPage'
import { CertificatePage } from './pages/outsourcing/CertificatePage'
import { SystemLayout } from './pages/system/SystemLayout'
import { OrganizationPage } from './pages/system/OrganizationPage'
import { MaterialPage } from './pages/system/MaterialPage'
import { ToolPage } from './pages/system/ToolPage'
import { DispatchRulePage } from './pages/production/DispatchRulePage'
import { WorkTimeApprovalPage } from './pages/production/WorkTimeApprovalPage'
import { ScrapManagementPage } from './pages/inventory/ScrapManagementPage'
import { WarehouseCoordinationPage } from './pages/inventory/WarehouseCoordinationPage'
import { InboundRecordPage } from './pages/inventory/InboundRecordPage'
import { MaterialReturnPage } from './pages/inventory/MaterialReturnPage'
import { LoanManagementPage } from './pages/inventory/LoanManagementPage'
import { DeliveryPage } from './pages/outsourcing/DeliveryPage'
import { QualityCheckPage } from './pages/outsourcing/QualityCheckPage'
import { OutsourcedDeviationPage } from './pages/outsourcing/OutsourcedDeviationPage'
import { ServiceLayout } from './pages/service/ServiceLayout'
import { CustomerAssetTransferPage } from './pages/service/CustomerAssetTransferPage'
import { CustomerAssetLedgerPage } from './pages/service/CustomerAssetLedgerPage'
import { ProductHandoverPage } from './pages/service/ProductHandoverPage'
import { FieldServicePage } from './pages/service/FieldServicePage'
import { EnergyMonitorPage } from './pages/dashboard/EnergyMonitorPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ForbiddenPage } from './pages/ForbiddenPage'
import BorderTestPage from './pages/test/BorderTestPage'
import LoadingTestPage from './pages/test/LoadingTestPage'
import KesiUiTestPage from './pages/test/KesiUiTestPage'
import { useAuth } from './contexts/AuthContext'
import { Button } from './components/ui/button'
import { LogOut, User } from 'lucide-react'
import { ProductionFlowNav } from './components/ProductionFlowNav'
import { getUserNavPrefixes, isAdmin } from './config/permissions'
import { ProtectedRoute } from './components/ProtectedRoute'

// 导航配置
const navGroups = [
  {
    label: '看板',
    items: [
      { path: '/dashboard', title: '看板' },
      { path: '/dashboard2', title: '车间大屏' },
      { path: '/dashboard3', title: '产线监控' },
      { path: '/dashboard4', title: 'IoT大屏' },
      { path: '/dashboard5', title: '数据可视化' },
      { path: '/dashboard6', title: '设备状态' },
      { path: '/energy-monitor', title: '能源监控(新)' },
    ],
  },
  {
    label: '业务',
    items: [
      { path: '/production/orders', match: '/production', title: '生产' },
      { path: '/quality/first-check', match: '/quality', title: '质量' },
      { path: '/inventory/overview', match: '/inventory', title: '库存' },
      { path: '/scheduling/routes', match: '/scheduling', title: '调度' },
      { path: '/equipment/monitor', match: '/equipment', title: '设备' },
      { path: '/outsourcing/list', match: '/outsourcing', title: '外协' },
      { path: '/service/customer-asset-transfer', match: '/service', title: '服务' },
    ],
  },
]

// 主布局
const MainLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string, match?: string) => {
    const current = location.pathname
    if (current === path) return true
    const prefix = match || path
    if (prefix !== '/' && current.startsWith(prefix + '/')) return true
    return false
  }

  // 根据角色过滤导航项
  const allowedPrefixes = getUserNavPrefixes(user)

  const visibleNavGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      // 看板类（无 match）仅管理员可见
      if (!item.match) return !allowedPrefixes
      return !allowedPrefixes || allowedPrefixes.includes(item.match)
    }),
  })).filter(group => group.items.length > 0)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* 顶部导航栏 */}
      <header className="backdrop-blur-xl bg-blue-500/10 border-b border-white/20 px-4 py-2 flex-shrink-0 z-10 shadow-lg shadow-blue-500/10">
        <div className="flex items-center h-full">
          {/* Logo */}
          <div className="flex-shrink-0 mr-6">
            <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] whitespace-nowrap">
              MES生产管理系统
            </h1>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 flex items-center h-full">
            {visibleNavGroups.map((group, gi) => (
              <div key={group.label} className="flex items-center h-full">
                {gi > 0 && (
                  <div className="w-px h-5 bg-white/10 mx-3" />
                )}
                {group.items.map((item) => {
                  const active = isActive(item.path, item.match)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        relative px-3 h-full flex items-center text-sm whitespace-nowrap transition-all duration-200
                        ${active
                          ? 'text-cyan-300 font-semibold'
                          : 'text-blue-100 hover:text-cyan-300'
                        }
                      `}
                    >
                      {item.title}
                      {active && (
                        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                      )}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>

          {/* 用户区域 */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <User className="w-4 h-4 text-cyan-400" />
              <span className="text-blue-50">{user?.name || '用户'}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-blue-100 hover:text-white hover:bg-blue-500/10 transition-all duration-200">
              <LogOut className="w-4 h-4 mr-1" />
              退出
            </Button>
          </div>
        </div>
      </header>

      {/* 主体内容区域 */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex gap-6 h-full">
          {/* 左侧流程导航 - 仅普通用户在生产相关页面显示 */}
          {!isAdmin(user) &&
          (location.pathname.startsWith('/production') ||
            location.pathname.startsWith('/quality') ||
            location.pathname.startsWith('/inventory') ||
            location.pathname.startsWith('/scheduling') ||
            location.pathname.startsWith('/outsourcing')) && (
            <ProductionFlowNav />
          )}

          {/* 主内容区域 */}
          <div className={`flex-1 min-w-0 transition-all duration-300 ${
            (location.pathname.startsWith('/production') ||
             location.pathname.startsWith('/quality') ||
             location.pathname.startsWith('/inventory') ||
             location.pathname.startsWith('/scheduling') ||
             location.pathname.startsWith('/outsourcing'))
              ? ''
              : 'w-full'
          }`}>
            <Outlet />
          </div>
        </div>
      </main>

      <footer className="backdrop-blur-sm bg-white/5 border-t border-white/10 flex-shrink-0 py-4 text-center text-sm text-blue-200/70">
        © 2025 MES生产管理系统 - AIRIOT前端演示 v2.0
      </footer>
    </div>
  )
}

const ProtectedMainLayout = () => (
  <ProtectedRoute>
    <MainLayout />
  </ProtectedRoute>
)

// 路由配置
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/test/border',
    element: <BorderTestPage />
  },
  {
    path: '/test/loading',
    element: <LoadingTestPage />
  },
  {
    path: '/test/kesi-ui',
    element: <KesiUiTestPage />
  },
  {
    path: '/403',
    element: <ForbiddenPage />
  },
  {
    path: '/dashboard2',
    element: (
      <ProtectedRoute>
        <Dashboard2Page />
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard3',
    element: (
      <ProtectedRoute>
        <ProductionLinePage />
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard4',
    element: (
      <ProtectedRoute>
        <IoTPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard5',
    element: (
      <ProtectedRoute>
        <FactoryDataPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard6',
    element: (
      <ProtectedRoute>
        <EquipmentStatusPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/',
    element: <ProtectedMainLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },

      // 生产管理
      {
        path: 'production',
        element: <ProductionLayout />,
        children: [
          { path: 'production-notice', element: <ProductionNoticePage /> },
	          { path: 'orders', element: <OrderListPage /> },
          { path: 'preparation-checklist', element: <PreparationChecklistPage /> },
          { path: 'trial-production-control', element: <TrialProductionControlPage /> },
          { path: 'production', element: <ProductionPage /> },
          { path: 'dispatch-rule', element: <DispatchRulePage /> },
          { path: 'work-orders', element: <WorkOrderPage /> },
          { path: 'work-report', element: <WorkReportPage /> },
          { path: 'scheduling', element: <SchedulingPage /> },
          { path: 'labor-standard', element: <LaborStandardPage /> },
          { path: 'labor-report', element: <LaborReportPage /> },
          { path: 'worktime', element: <WorkTimePage /> },
          { path: 'worktime-approval', element: <WorkTimeApprovalPage /> },
          { path: 'development', element: <DevelopmentPage /> },
          { path: 'downgrade-use', element: <DowngradeUsePage /> },
          { index: true, element: <Navigate to="/production/orders" replace /> },
        ]
      },

      // 质量管理
      {
        path: 'quality',
        element: <QualityLayout />,
        children: [
          { path: 'first-check', element: <FirstCheckPage /> },
          { path: 'final-check', element: <FinalCheckPage /> },
          { path: 'final-inspection', element: <FinalInspectionPage /> },
          { path: 'spc', element: <SPCPage /> },
          { path: 'trace', element: <TracePage /> },
          { path: 'repair', element: <RepairOrderPage /> },
          { path: 'scrap', element: <ScrapOrderPage /> },
          { path: 'nonconforming-review', element: <NonconformingReviewPage /> },
          { path: 'test-preparation-check', element: <TestPreparationCheckPage /> },
          { path: 'test-environment-record', element: <TestEnvironmentRecordPage /> },
          { path: 'emergency-release', element: <EmergencyReleasePage /> },
          { path: 'inspection-stamp', element: <InspectionStampPage /> },
          { index: true, element: <Navigate to="/quality/first-check" replace /> },
        ]
      },

      // 库存管理
      {
        path: 'inventory',
        element: <InventoryLayout />,
        children: [
          { path: 'overview', element: <InventoryPage /> },
          { path: 'requisition', element: <MaterialRequisitionPage /> },
          { path: 'product-inbound', element: <ProductInboundPage /> },
          { path: 'semi-finished-inbound', element: <SemiFinishedInboundPage /> },
          { path: 'details', element: <InventoryDetailPage /> },
          { path: 'transactions', element: <InventoryTransactionPage /> },
          { path: 'inventory-location', element: <InventoryLocationPage /> },
          { path: 'warehouse-transfer', element: <WarehouseTransferPage /> },
          { path: 'scrap-management', element: <ScrapManagementPage /> },
          { path: 'warehouse-coordination', element: <WarehouseCoordinationPage /> },
          { path: 'materials', element: <MaterialPage /> },
          { path: 'tools', element: <ToolPage /> },
          { path: 'inbound-record', element: <InboundRecordPage /> },
          { path: 'material-return', element: <MaterialReturnPage /> },
          { path: 'loan-management', element: <LoanManagementPage /> },
          { index: true, element: <Navigate to="/inventory/overview" replace /> },
        ]
      },

      // 调度管理
      {
        path: 'scheduling',
        element: <ProcessLayout />,
        children: [
          { path: 'routes', element: <RouteListPage /> },
          { path: 'match', element: <RouteMatchPage /> },
          { path: 'processes', element: <ProcessListPage /> },
          { index: true, element: <Navigate to="/scheduling/routes" replace /> },
        ]
      },

      // 设备管理
      {
        path: 'equipment',
        element: <EquipmentLayout />,
        children: [
          { path: 'monitor', element: <EquipmentMonitorPage /> },
          { path: 'list', element: <EquipmentListPage /> },
          { path: 'maintenance', element: <MaintenancePage /> },
          { path: 'inspection', element: <InspectionPage /> },
          { path: 'gauge', element: <GaugeInspectionPage /> },
          { path: 'tool-maintenance', element: <ToolMaintenancePage /> },
          { path: ':id', element: <EquipmentDetailPage /> },
          { path: 'import-data', element: <ImportEquipmentPage /> },
          { index: true, element: <Navigate to="/equipment/monitor" replace /> },
        ]
      },

      // 外协管理
      {
        path: 'outsourcing',
        element: <OutsourcingLayout />,
        children: [
          { path: 'list', element: <OutsourcingListPage /> },
          { path: 'pending', element: <OutsourcingPendingPage /> },
          { path: 'delivery', element: <DeliveryPage /> },
          { path: 'quality-check', element: <QualityCheckPage /> },
          { path: 'certificate', element: <CertificatePage /> },
          { path: 'outsourced-deviation', element: <OutsourcedDeviationPage /> },
          { index: true, element: <Navigate to="/outsourcing/list" replace /> },
        ]
      },

      // 服务管理
      {
        path: 'service',
        element: <ServiceLayout />,
        children: [
          { path: 'customer-asset-transfer', element: <CustomerAssetTransferPage /> },
          { path: 'customer-asset-ledger', element: <CustomerAssetLedgerPage /> },
          { path: 'product-handover', element: <ProductHandoverPage /> },
          { path: 'field-service', element: <FieldServicePage /> },
          { index: true, element: <Navigate to="/service/customer-asset-transfer" replace /> },
        ]
      },

      // 能源监控
      {
        path: 'energy-monitor',
        element: <EnergyMonitorPage />
      },

      // 系统管理 (功能已移至库存管理)
      // {
      //   path: 'system',
      //   element: <SystemLayout />,
      //   children: [
      //     { path: 'organization', element: <OrganizationPage /> },
      //     { path: 'materials', element: <MaterialPage /> },
      //     { path: 'tools', element: <ToolPage /> },
      //     { index: true, element: <Navigate to="/system/organization" replace /> },
      //   ]
      // },
    ]
  },

  {
    path: '*',
    element: <NotFoundPage />
  }
])
