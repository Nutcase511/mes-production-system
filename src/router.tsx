import React, { Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet, useNavigate, Link, useLocation } from 'react-router-dom'

const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const Dashboard2Page = React.lazy(() => import('./pages/dashboard/Dashboard2Page').then(m => ({ default: m.Dashboard2Page })))
const ProductionLinePage = React.lazy(() => import('./pages/dashboard/ProductionLinePage').then(m => ({ default: m.ProductionLinePage })))
const IoTPage = React.lazy(() => import('./pages/dashboard/IoTPage').then(m => ({ default: m.IoTPage })))
const FactoryDataPage = React.lazy(() => import('./pages/dashboard/FactoryDataPage').then(m => ({ default: m.FactoryDataPage })))
const EquipmentStatusPage = React.lazy(() => import('./pages/dashboard/EquipmentStatusPage').then(m => ({ default: m.EquipmentStatusPage })))
const ProductionNoticePage = React.lazy(() => import('./pages/production/ProductionNoticePage').then(m => ({ default: m.ProductionNoticePage })))
const OrderListPage = React.lazy(() => import('./pages/production/OrderListPage').then(m => ({ default: m.OrderListPage })))
const PreparationChecklistPage = React.lazy(() => import('./pages/production/PreparationChecklistPage').then(m => ({ default: m.PreparationChecklistPage })))
const TrialProductionControlPage = React.lazy(() => import('./pages/production/TrialProductionControlPage').then(m => ({ default: m.TrialProductionControlPage })))
const ProductionPage = React.lazy(() => import('./pages/production/ProductionPage').then(m => ({ default: m.ProductionPage })))
const WorkOrderPage = React.lazy(() => import('./pages/production/WorkOrderPage').then(m => ({ default: m.WorkOrderPage })))
const WorkTimePage = React.lazy(() => import('./pages/production/WorkTimePage').then(m => ({ default: m.WorkTimePage })))
const DevelopmentPage = React.lazy(() => import('./pages/production/DevelopmentPage').then(m => ({ default: m.DevelopmentPage })))
const WorkReportPage = React.lazy(() => import('./pages/production/WorkReportPage').then(m => ({ default: m.WorkReportPage })))
const SchedulingPage = React.lazy(() => import('./pages/production/SchedulingPage').then(m => ({ default: m.SchedulingPage })))
const LaborStandardPage = React.lazy(() => import('./pages/production/LaborStandardPage').then(m => ({ default: m.LaborStandardPage })))
const LaborReportPage = React.lazy(() => import('./pages/production/LaborReportPage').then(m => ({ default: m.LaborReportPage })))
const DowngradeUsePage = React.lazy(() => import('./pages/production/DowngradeUsePage').then(m => ({ default: m.DowngradeUsePage })))
const DispatchRulePage = React.lazy(() => import('./pages/production/DispatchRulePage').then(m => ({ default: m.DispatchRulePage })))
const WorkTimeApprovalPage = React.lazy(() => import('./pages/production/WorkTimeApprovalPage').then(m => ({ default: m.WorkTimeApprovalPage })))
const OrderDispatchPage = React.lazy(() => import('./pages/production/OrderDispatchPage').then(m => ({ default: m.OrderDispatchPage })))
const DispatchDetailPage = React.lazy(() => import('./pages/production/DispatchDetailPage').then(m => ({ default: m.DispatchDetailPage })))
const ProductionTypeDeterminationPage = React.lazy(() => import('./pages/production/ProductionTypeDeterminationPage').then(m => ({ default: m.ProductionTypeDeterminationPage })))
const FirstCheckPage = React.lazy(() => import('./pages/quality/FirstCheckPage').then(m => ({ default: m.FirstCheckPage })))
const FinalCheckPage = React.lazy(() => import('./pages/quality/FinalCheckPage').then(m => ({ default: m.FinalCheckPage })))
const FinalInspectionPage = React.lazy(() => import('./pages/quality/FinalInspectionPage').then(m => ({ default: m.FinalInspectionPage })))
const SPCPage = React.lazy(() => import('./pages/quality/SPCPage').then(m => ({ default: m.SPCPage })))
const TracePage = React.lazy(() => import('./pages/quality/TracePage').then(m => ({ default: m.TracePage })))
const RepairOrderPage = React.lazy(() => import('./pages/quality/RepairOrderPage').then(m => ({ default: m.RepairOrderPage })))
const ScrapOrderPage = React.lazy(() => import('./pages/quality/ScrapOrderPage').then(m => ({ default: m.ScrapOrderPage })))
const NonconformingReviewPage = React.lazy(() => import('./pages/quality/NonconformingReviewPage').then(m => ({ default: m.NonconformingReviewPage })))
const TestPreparationCheckPage = React.lazy(() => import('./pages/quality/TestPreparationCheckPage').then(m => ({ default: m.TestPreparationCheckPage })))
const TestEnvironmentRecordPage = React.lazy(() => import('./pages/quality/TestEnvironmentRecordPage').then(m => ({ default: m.TestEnvironmentRecordPage })))
const EmergencyReleasePage = React.lazy(() => import('./pages/quality/EmergencyReleasePage').then(m => ({ default: m.EmergencyReleasePage })))
const InspectionStampPage = React.lazy(() => import('./pages/quality/InspectionStampPage').then(m => ({ default: m.InspectionStampPage })))
const InventoryPage = React.lazy(() => import('./pages/inventory/InventoryPage').then(m => ({ default: m.InventoryPage })))
const MaterialRequisitionPage = React.lazy(() => import('./pages/inventory/MaterialRequisitionPage').then(m => ({ default: m.MaterialRequisitionPage })))
const ProductInboundPage = React.lazy(() => import('./pages/inventory/ProductInboundPage').then(m => ({ default: m.ProductInboundPage })))
const SemiFinishedInboundPage = React.lazy(() => import('./pages/inventory/SemiFinishedInboundPage').then(m => ({ default: m.SemiFinishedInboundPage })))
const PurchaseOrderPage = React.lazy(() => import('./pages/inventory/PurchaseOrderPage').then(m => ({ default: m.PurchaseOrderPage })))
const InventoryDetailPage = React.lazy(() => import('./pages/inventory/InventoryDetailPage').then(m => ({ default: m.InventoryDetailPage })))
const InventoryTransactionPage = React.lazy(() => import('./pages/inventory/InventoryTransactionPage').then(m => ({ default: m.InventoryTransactionPage })))
const InventoryLocationPage = React.lazy(() => import('./pages/inventory/InventoryLocationPage').then(m => ({ default: m.InventoryLocationPage })))
const WarehouseTransferPage = React.lazy(() => import('./pages/inventory/WarehouseTransferPage').then(m => ({ default: m.WarehouseTransferPage })))
const ScrapManagementPage = React.lazy(() => import('./pages/inventory/ScrapManagementPage').then(m => ({ default: m.ScrapManagementPage })))
const WarehouseCoordinationPage = React.lazy(() => import('./pages/inventory/WarehouseCoordinationPage').then(m => ({ default: m.WarehouseCoordinationPage })))
const InboundRecordPage = React.lazy(() => import('./pages/inventory/InboundRecordPage').then(m => ({ default: m.InboundRecordPage })))
const MaterialReturnPage = React.lazy(() => import('./pages/inventory/MaterialReturnPage').then(m => ({ default: m.MaterialReturnPage })))
const LoanManagementPage = React.lazy(() => import('./pages/inventory/LoanManagementPage').then(m => ({ default: m.LoanManagementPage })))
const InventoryAlertPage = React.lazy(() => import('./pages/inventory/InventoryAlertPage').then(m => ({ default: m.InventoryAlertPage })))
const EquipmentMonitorPage = React.lazy(() => import('./pages/equipment/EquipmentMonitorPage').then(m => ({ default: m.EquipmentMonitorPage })))
const EquipmentDetailPage = React.lazy(() => import('./pages/equipment/EquipmentDetailPage').then(m => ({ default: m.EquipmentDetailPage })))
const EquipmentListPage = React.lazy(() => import('./pages/equipment/EquipmentListPage').then(m => ({ default: m.EquipmentListPage })))
const MaintenancePage = React.lazy(() => import('./pages/equipment/MaintenancePage').then(m => ({ default: m.MaintenancePage })))
const InspectionPage = React.lazy(() => import('./pages/equipment/InspectionPage').then(m => ({ default: m.InspectionPage })))
const GaugeInspectionPage = React.lazy(() => import('./pages/equipment/GaugeInspectionPage').then(m => ({ default: m.GaugeInspectionPage })))
const ToolMaintenancePage = React.lazy(() => import('./pages/equipment/ToolMaintenancePage').then(m => ({ default: m.ToolMaintenancePage })))
const ImportEquipmentPage = React.lazy(() => import('./pages/equipment/ImportEquipmentPage'))
const RouteListPage = React.lazy(() => import('./pages/process/RouteListPage').then(m => ({ default: m.RouteListPage })))
const RouteMatchPage = React.lazy(() => import('./pages/process/RouteMatchPage').then(m => ({ default: m.RouteMatchPage })))
const ProcessListPage = React.lazy(() => import('./pages/process/ProcessListPage').then(m => ({ default: m.ProcessListPage })))
const OutsourcingListPage = React.lazy(() => import('./pages/outsourcing/OutsourcingListPage').then(m => ({ default: m.OutsourcingListPage })))
const OutsourcingPendingPage = React.lazy(() => import('./pages/outsourcing/OutsourcingPendingPage').then(m => ({ default: m.OutsourcingPendingPage })))
const CertificatePage = React.lazy(() => import('./pages/outsourcing/CertificatePage').then(m => ({ default: m.CertificatePage })))
const DeliveryPage = React.lazy(() => import('./pages/outsourcing/DeliveryPage').then(m => ({ default: m.DeliveryPage })))
const QualityCheckPage = React.lazy(() => import('./pages/outsourcing/QualityCheckPage').then(m => ({ default: m.QualityCheckPage })))
const OutsourcedDeviationPage = React.lazy(() => import('./pages/outsourcing/OutsourcedDeviationPage').then(m => ({ default: m.OutsourcedDeviationPage })))
const OutsourcingProgressPage = React.lazy(() => import('./pages/outsourcing/OutsourcingProgressPage').then(m => ({ default: m.OutsourcingProgressPage })))
const OrganizationPage = React.lazy(() => import('./pages/system/OrganizationPage').then(m => ({ default: m.OrganizationPage })))
const MaterialPage = React.lazy(() => import('./pages/system/MaterialPage').then(m => ({ default: m.MaterialPage })))
const ToolPage = React.lazy(() => import('./pages/system/ToolPage').then(m => ({ default: m.ToolPage })))
const SupplierPage = React.lazy(() => import('./pages/system/SupplierPage').then(m => ({ default: m.SupplierPage })))
const CustomerAssetTransferPage = React.lazy(() => import('./pages/service/CustomerAssetTransferPage').then(m => ({ default: m.CustomerAssetTransferPage })))
const CustomerAssetLedgerPage = React.lazy(() => import('./pages/service/CustomerAssetLedgerPage').then(m => ({ default: m.CustomerAssetLedgerPage })))
const ProductHandoverPage = React.lazy(() => import('./pages/service/ProductHandoverPage').then(m => ({ default: m.ProductHandoverPage })))
const FieldServicePage = React.lazy(() => import('./pages/service/FieldServicePage').then(m => ({ default: m.FieldServicePage })))
const EnergyMonitorPage = React.lazy(() => import('./pages/dashboard/EnergyMonitorPage').then(m => ({ default: m.EnergyMonitorPage })))
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))
const ForbiddenPage = React.lazy(() => import('./pages/ForbiddenPage').then(m => ({ default: m.ForbiddenPage })))
const BorderTestPage = React.lazy(() => import('./pages/test/BorderTestPage'))
const LoadingTestPage = React.lazy(() => import('./pages/test/LoadingTestPage'))
const KesiUiTestPage = React.lazy(() => import('./pages/test/KesiUiTestPage'))

import { ProductionLayout } from './pages/production/ProductionLayout'
import { QualityLayout } from './pages/quality/QualityLayout'
import { InventoryLayout } from './pages/inventory/InventoryLayout'
import { EquipmentLayout } from './pages/equipment/EquipmentLayout'
import { ProcessLayout } from './pages/process/ProcessLayout'
import { OutsourcingLayout } from './pages/outsourcing/OutsourcingLayout'
import { ServiceLayout } from './pages/service/ServiceLayout'
import { SystemLayout } from './pages/system/SystemLayout'
import { useAuth } from './contexts/AuthContext'
import { Button } from './components/ui/button'
import { LogOut, User } from 'lucide-react'
import { ProductionFlowNav } from './components/ProductionFlowNav'
import { getUserNavPrefixes, isAdmin } from './config/permissions'
import { ProtectedRoute } from './components/ProtectedRoute'

const LazyLoad = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
    </div>
  }>
    {children}
  </Suspense>
)

// 导航配置
interface NavItem {
  path: string
  title: string
  match?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
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
    element: <LazyLoad><LoginPage /></LazyLoad>
  },
  {
    path: '/test/border',
    element: <LazyLoad><BorderTestPage /></LazyLoad>
  },
  {
    path: '/test/loading',
    element: <LazyLoad><LoadingTestPage /></LazyLoad>
  },
  {
    path: '/test/kesi-ui',
    element: <LazyLoad><KesiUiTestPage /></LazyLoad>
  },
  {
    path: '/403',
    element: <LazyLoad><ForbiddenPage /></LazyLoad>
  },
  {
    path: '/dashboard2',
    element: (
      <ProtectedRoute>
        <LazyLoad><Dashboard2Page /></LazyLoad>
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard3',
    element: (
      <ProtectedRoute>
        <LazyLoad><ProductionLinePage /></LazyLoad>
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard4',
    element: (
      <ProtectedRoute>
        <LazyLoad><IoTPage /></LazyLoad>
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard5',
    element: (
      <ProtectedRoute>
        <LazyLoad><FactoryDataPage /></LazyLoad>
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard6',
    element: (
      <ProtectedRoute>
        <LazyLoad><EquipmentStatusPage /></LazyLoad>
      </ProtectedRoute>
    )
  },
  {
    path: '/',
    element: <ProtectedMainLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <LazyLoad><DashboardPage /></LazyLoad> },

      // 生产管理
      {
        path: 'production',
        element: <ProductionLayout />,
        children: [
          { path: 'production-notice', element: <LazyLoad><ProductionNoticePage /></LazyLoad> },
          { path: 'orders', element: <LazyLoad><OrderListPage /></LazyLoad> },
          { path: 'preparation-checklist', element: <LazyLoad><PreparationChecklistPage /></LazyLoad> },
          { path: 'trial-production-control', element: <LazyLoad><TrialProductionControlPage /></LazyLoad> },
          { path: 'production', element: <LazyLoad><ProductionPage /></LazyLoad> },
          { path: 'dispatch-rule', element: <LazyLoad><DispatchRulePage /></LazyLoad> },
          { path: 'work-orders', element: <LazyLoad><WorkOrderPage /></LazyLoad> },
          { path: 'work-report', element: <LazyLoad><WorkReportPage /></LazyLoad> },
          { path: 'scheduling', element: <LazyLoad><SchedulingPage /></LazyLoad> },
          { path: 'labor-standard', element: <LazyLoad><LaborStandardPage /></LazyLoad> },
          { path: 'labor-report', element: <LazyLoad><LaborReportPage /></LazyLoad> },
          { path: 'worktime', element: <LazyLoad><WorkTimePage /></LazyLoad> },
          { path: 'worktime-approval', element: <LazyLoad><WorkTimeApprovalPage /></LazyLoad> },
          { path: 'development', element: <LazyLoad><DevelopmentPage /></LazyLoad> },
          { path: 'downgrade-use', element: <LazyLoad><DowngradeUsePage /></LazyLoad> },
          { path: 'order-dispatch', element: <LazyLoad><OrderDispatchPage /></LazyLoad> },
          { path: 'dispatch-detail/:id', element: <LazyLoad><DispatchDetailPage /></LazyLoad> },
          { path: 'production-type-determination', element: <LazyLoad><ProductionTypeDeterminationPage /></LazyLoad> },
          { index: true, element: <Navigate to="/production/orders" replace /> },
        ]
      },

      // 质量管理
      {
        path: 'quality',
        element: <QualityLayout />,
        children: [
          { path: 'first-check', element: <LazyLoad><FirstCheckPage /></LazyLoad> },
          { path: 'final-check', element: <LazyLoad><FinalCheckPage /></LazyLoad> },
          { path: 'final-inspection', element: <LazyLoad><FinalInspectionPage /></LazyLoad> },
          { path: 'spc', element: <LazyLoad><SPCPage /></LazyLoad> },
          { path: 'trace', element: <LazyLoad><TracePage /></LazyLoad> },
          { path: 'repair', element: <LazyLoad><RepairOrderPage /></LazyLoad> },
          { path: 'scrap', element: <LazyLoad><ScrapOrderPage /></LazyLoad> },
          { path: 'nonconforming-review', element: <LazyLoad><NonconformingReviewPage /></LazyLoad> },
          { path: 'test-preparation-check', element: <LazyLoad><TestPreparationCheckPage /></LazyLoad> },
          { path: 'test-environment-record', element: <LazyLoad><TestEnvironmentRecordPage /></LazyLoad> },
          { path: 'emergency-release', element: <LazyLoad><EmergencyReleasePage /></LazyLoad> },
          { path: 'inspection-stamp', element: <LazyLoad><InspectionStampPage /></LazyLoad> },
          { index: true, element: <Navigate to="/quality/first-check" replace /> },
        ]
      },

      // 库存管理
      {
        path: 'inventory',
        element: <InventoryLayout />,
        children: [
          { path: 'overview', element: <LazyLoad><InventoryPage /></LazyLoad> },
          { path: 'requisition', element: <LazyLoad><MaterialRequisitionPage /></LazyLoad> },
          { path: 'product-inbound', element: <LazyLoad><ProductInboundPage /></LazyLoad> },
          { path: 'semi-finished-inbound', element: <LazyLoad><SemiFinishedInboundPage /></LazyLoad> },
          { path: 'details', element: <LazyLoad><InventoryDetailPage /></LazyLoad> },
          { path: 'transactions', element: <LazyLoad><InventoryTransactionPage /></LazyLoad> },
          { path: 'inventory-location', element: <LazyLoad><InventoryLocationPage /></LazyLoad> },
          { path: 'warehouse-transfer', element: <LazyLoad><WarehouseTransferPage /></LazyLoad> },
          { path: 'scrap-management', element: <LazyLoad><ScrapManagementPage /></LazyLoad> },
          { path: 'warehouse-coordination', element: <LazyLoad><WarehouseCoordinationPage /></LazyLoad> },
          { path: 'materials', element: <LazyLoad><MaterialPage /></LazyLoad> },
          { path: 'tools', element: <LazyLoad><ToolPage /></LazyLoad> },
          { path: 'inbound-record', element: <LazyLoad><InboundRecordPage /></LazyLoad> },
          { path: 'material-return', element: <LazyLoad><MaterialReturnPage /></LazyLoad> },
          { path: 'loan-management', element: <LazyLoad><LoanManagementPage /></LazyLoad> },
          { path: 'inventory-alert', element: <LazyLoad><InventoryAlertPage /></LazyLoad> },
          { path: 'supplier', element: <LazyLoad><SupplierPage /></LazyLoad> },
          { path: 'organization', element: <LazyLoad><OrganizationPage /></LazyLoad> },
          { index: true, element: <Navigate to="/inventory/overview" replace /> },
        ]
      },

      // 调度管理
      {
        path: 'scheduling',
        element: <ProcessLayout />,
        children: [
          { path: 'routes', element: <LazyLoad><RouteListPage /></LazyLoad> },
          { path: 'match', element: <LazyLoad><RouteMatchPage /></LazyLoad> },
          { path: 'processes', element: <LazyLoad><ProcessListPage /></LazyLoad> },
          { index: true, element: <Navigate to="/scheduling/routes" replace /> },
        ]
      },

      // 设备管理
      {
        path: 'equipment',
        element: <EquipmentLayout />,
        children: [
          { path: 'monitor', element: <LazyLoad><EquipmentMonitorPage /></LazyLoad> },
          { path: 'list', element: <LazyLoad><EquipmentListPage /></LazyLoad> },
          { path: 'maintenance', element: <LazyLoad><MaintenancePage /></LazyLoad> },
          { path: 'inspection', element: <LazyLoad><InspectionPage /></LazyLoad> },
          { path: 'gauge', element: <LazyLoad><GaugeInspectionPage /></LazyLoad> },
          { path: 'tool-maintenance', element: <LazyLoad><ToolMaintenancePage /></LazyLoad> },
          { path: ':id', element: <LazyLoad><EquipmentDetailPage /></LazyLoad> },
          { path: 'import-data', element: <LazyLoad><ImportEquipmentPage /></LazyLoad> },
          { index: true, element: <Navigate to="/equipment/monitor" replace /> },
        ]
      },

      // 外协管理
      {
        path: 'outsourcing',
        element: <OutsourcingLayout />,
        children: [
          { path: 'list', element: <LazyLoad><OutsourcingListPage /></LazyLoad> },
          { path: 'pending', element: <LazyLoad><OutsourcingPendingPage /></LazyLoad> },
          { path: 'delivery', element: <LazyLoad><DeliveryPage /></LazyLoad> },
          { path: 'quality-check', element: <LazyLoad><QualityCheckPage /></LazyLoad> },
          { path: 'certificate', element: <LazyLoad><CertificatePage /></LazyLoad> },
          { path: 'outsourced-deviation', element: <LazyLoad><OutsourcedDeviationPage /></LazyLoad> },
          { path: 'progress', element: <LazyLoad><OutsourcingProgressPage /></LazyLoad> },
          { index: true, element: <Navigate to="/outsourcing/list" replace /> },
        ]
      },

      // 服务管理
      {
        path: 'service',
        element: <ServiceLayout />,
        children: [
          { path: 'customer-asset-transfer', element: <LazyLoad><CustomerAssetTransferPage /></LazyLoad> },
          { path: 'customer-asset-ledger', element: <LazyLoad><CustomerAssetLedgerPage /></LazyLoad> },
          { path: 'product-handover', element: <LazyLoad><ProductHandoverPage /></LazyLoad> },
          { path: 'field-service', element: <LazyLoad><FieldServicePage /></LazyLoad> },
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
    element: <LazyLoad><NotFoundPage /></LazyLoad>
  }
])
