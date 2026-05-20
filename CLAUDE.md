# MES 生产管理系统前端

基于 React + AIRIOT SDK 的制造执行系统前端项目。

## 技术栈

- **框架**: React 19 + TypeScript 5.9
- **构建**: Vite 8
- **样式**: Tailwind CSS v4（CSS-first 配置，无 tailwind.config.js）
- **UI 组件**: shadcn/ui（Radix UI 原语 + cva），路径 `@/components/ui/`
- **平台 SDK**: `@airiot/client` 1.0.12
- **路由**: react-router-dom 7
- **图表**: echarts + echarts-for-react + recharts
- **HTTP**: axios
- **认证**: crypto-js（SHA1 密码哈希）

## 开发命令

```bash
npm run dev       # 启动开发服务器（端口 3001）
npm run build     # tsc + vite build
npm run lint      # eslint
npm run preview   # 预览构建产物
```

## 项目结构

```
src/
  main.tsx              # 入口：初始化 AIRIOT 客户端 + 注册模型
  App.tsx               # 根组件：AuthProvider > RouterProvider + ToastContainer
  router.tsx            # 全部路由定义（createBrowserRouter）+ MainLayout
  index.css             # Tailwind v4 入口 + CSS 自定义属性（深蓝科技风主题）
  contexts/
    AuthContext.tsx      # 认证上下文（useAuth hook）
  components/
    ui/                 # 43 个 shadcn/ui 基础组件
    airiot/             # AIRIOT SDK 组件（已排除 tsconfig 检查）
    ProductionFlowNav   # 左侧生产流转流程导航
    OperationGuidePreview  # 操作指导书预览
    QRScanner           # 二维码扫描
  pages/
    dashboard/          # 看板、车间大屏、产线监控、IoT、数据可视化、设备状态
    production/         # 生产管理（订单、跟单、准备检查、试产控制、正式生产等）
    quality/            # 质量管理（首检、终检、SPC、追溯、返修、报废）
    inventory/          # 库存管理（库存、领料、入库、采购等）
    process/            # 调度管理（工艺路线、工艺匹配、工序列表）
    equipment/          # 设备管理（监控、列表、维保、点检、量具）
    outsourcing/        # 外协管理（列表、待处理、交货、质检、合格证）
  services/             # 各领域服务文件（38个）
  hooks/                # 自定义 hooks（useApi, useProduction, useTableData 等）
  config/               # 表配置
  types/                # TypeScript 类型定义
  lib/
    utils.ts            # cn() 工具函数、日期格式化、状态变体映射
    airiot-client.ts    # AIRIOT SDK 初始化
```

## 技术约定

### UI 风格
- **深蓝科技风暗色主题**，所有页面遵循统一风格
- 卡片样式：`backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl` + `borderColor: 'rgba(59, 130, 246, 0.3)'`
- 主色调：cyan-300（标题）、blue-200（正文）、blue-400/30（边框）
- 渐变按钮：`bg-gradient-to-r from-blue-400 to-cyan-400`
- CSS 自定义属性定义在 `src/index.css` 的 `:root` 中

### AIRIOT SDK 核心 Hooks
```tsx
useModel()          // 获取当前模型元数据
useModelList()      // 获取模型数据列表（items, loading）
useModelSave()      // 保存/更新记录（saveItem）
useModelGetItems()  // 刷新列表（getItems）
```

### 页面开发模式
生产控制类页面统一使用左右分栏布局：
- 左侧：工单列表（`useModelList` 获取数据）
- 右侧：操作区域（设备点检、验证、状态控制等卡片）

每个页面包裹在 `<TableView tableId={...}>` 中，用于连接 AIRIOT 数据源。

### 路由结构
- 主布局 `MainLayout` 在 `router.tsx` 中定义（顶部导航 + main 内容区）
- 各模块有独立 Layout 组件（ProductionLayout、QualityLayout 等）
- 路由保护使用 `ProtectedRoute` 组件

### 认证机制
- `AuthContext` 提供 `user`、`isAuthenticated`、`isLoading`、`hasPermission()`
- 用户数据存储在 localStorage（`user` + `token`）
- 与 AIRIOT SDK 双同步：登录后调用 `useAiriotUser().setUser()`
- 密码使用 SHA1 哈希

## 业务逻辑

### 生产流转流程（13个环节，按顺序）

| 序号 | 环节 | 路径 | 分类 |
|------|------|------|------|
| 1 | 订单接入 | /production/orders | 生产控制 |
| 2 | 工艺路线制定 | /process/routes | 调度管理 |
| 3 | 工艺规程下发 | /process/processes | 调度管理 |
| 4 | 生产跟单生成 | /production/work-orders | 生产控制 |
| 5 | 准备状态检查 | /production/preparation-checklist | 生产控制 |
| 6 | 领料执行 | /inventory/requisition | 库存管理 |
| 7 | 试生产控制 | /production/trial-production-control | 生产控制 |
| 8 | 首检 | /quality/first-check | 质量管理 |
| 9 | 正式生产 | /production/production | 生产控制 |
| 10 | 终检 | /quality/final-check | 质量管理 |
| 11 | 成品入库 | /inventory/product-inbound | 库存管理 |
| 12 | 工时核销 | /production/worktime | 生产控制 |
| 13 | 外协管理 | /outsourcing/list | 外协管理 |

### 关键状态字段（生产跟单表）

- `select-6D54`：生产状态
  - 0=未开始, 1=待试产, 2=试产通过, 3=试产完成, 4=生产中, 5=生产完成, 6=生产中(正式)
- `select-C354`：准备状态（1=待检查, 2=已完成）

### 页面权限控制逻辑

**角色**：
- 管理员（admin）/ 超级管理员：可见全部页面
- 普通用户：仅可见绑定设备对应的工序页面

**数据关系**：普通用户 → 1台设备 → N个工序 → N个页面（一个员工只允许操作一台设备）

**显示规则**：
- 顶部导航栏：普通用户只显示有权限的导航项
- 左侧生产流转流程导航：所有人都能看到全部环节（全局流程可视化），仅作展示不可点击
- 无权限页面访问：跳转 /403

**数据来源**（全部来自 AIRIOT 平台）：
- 用户表（id: user）：权限字段、管理员标识、部门标识
- 用户-设备绑定：平台已有
- 设备-工序关联：平台已有

详细文档见 `权限控制逻辑.md`。

### 附件/文件处理
- AIRIOT 附件字段数据结构：`{ name: string, url: string, preview?: string }`
- 文件 URL 处理：`url.length > 200` 视为 base64，否则拼接 `/rest` 前缀
- 参考组件：`src/components/airiot/view-field-show-attachment/`
- 操作指导书组件：`src/components/OperationGuidePreview.tsx`
