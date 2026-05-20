# AIRIOT 后端接入指南（使用官方 @airiot/client SDK）

本文档说明如何将MES前端项目接入到AIRIOT后端服务，使用官方的 @airiot/client SDK。

## 📋 目录

- [配置说明](#配置说明)
- [项目架构](#项目架构)
- [SDK初始化](#sdk初始化)
- [API服务层](#api服务层)
- [切换到真实API](#切换到真实api)
- [数据表配置](#数据表配置)
- [常见问题](#常见问题)

## 🔧 配置说明

### 环境变量配置

项目根目录的 `.env` 文件包含AIRIOT连接配置：

```bash
# AIRIOT服务器地址
VITE_AIRIOT_API_URL=https://demo.airiot.link

# 项目ID
VITE_AIRIOT_PROJECT_ID=681dade8df39cd9d08ab9ffb

# 应用ID（可选）
VITE_AIRIOT_APP_ID=

# 是否使用Mock数据（开发阶段）
VITE_USE_MOCK_DATA=true

# API超时时间（毫秒）
VITE_API_TIMEOUT=30000
```

### 配置项说明

| 配置项 | 说明 | 示例 | 必填 |
|--------|------|------|------|
| `VITE_AIRIOT_API_URL` | AIRIOT服务器地址 | `https://demo.airiot.link` | ✅ |
| `VITE_AIRIOT_PROJECT_ID` | 项目唯一标识 | `681dade8df39cd9d08ab9ffb` | ✅ |
| `VITE_AIRIOT_APP_ID` | 应用ID（如有多应用） | - | ❌ |
| `VITE_USE_MOCK_DATA` | 是否使用Mock数据 | `true`/`false` | ❌ |
| `VITE_API_TIMEOUT` | API请求超时时间 | `30000` | ❌ |

## 🏗️ 项目架构

### 目录结构

```
src/
├── lib/
│   ├── airiot-client.ts    # AIRIOT SDK客户端配置
│   └── mock-data.ts        # Mock数据生成
├── services/               # API服务层
│   ├── auth.service.ts     # 认证服务
│   ├── production.service.ts  # 生产订单服务
│   ├── quality.service.ts  # 质量检验服务
│   ├── inventory.service.ts   # 库存服务
│   ├── equipment.service.ts   # 设备服务
│   └── process.service.ts     # 工艺服务
├── hooks/
│   ├── useApi.ts           # 通用API Hooks
│   ├── useProduction.ts    # 生产数据Hooks
│   └── useMockData.ts      # Mock数据Hooks（兼容旧代码）
├── contexts/
│   └── AuthContext.tsx     # 认证上下文（已改造）
├── types/
│   ├── api.ts              # API类型定义
│   └── ...                 # 其他类型定义
└── pages/                  # 页面组件
```

### 数据流

```
页面组件 (Pages)
    ↓
自定义 Hooks (Hooks)
    ↓
API 服务层 (Services)
    ↓
@airiot/client SDK (createAPI)
    ↓
AIRIOT 后端服务
```

## 🔌 SDK初始化

### 在 main.tsx 中初始化

```typescript
import { initAiriotClient } from '@/lib/airiot-client'

// 在应用启动时初始化
initAiriotClient()
```

### 创建API实例

```typescript
import { createAPI, setConfig } from '@airiot/client'
import { initAiriotClient, createCatalogAPI } from '@/lib/airiot-client'

// 方式1：直接使用预定义的初始化函数（推荐）
initAiriotClient()  // 在 main.tsx 中调用

// 方式2：创建特定API实例
const api = createCatalogAPI()  // 创建数据表API实例

// 使用SDK的方法
const { items, total } = await api.query(
  { tableId: 'production_orders' },  // filter
  wheres,                            // wheres (过滤条件数组)
  true,                              // withCount (是否计数)
  { skip: 0, limit: 20 }             // 分页参数
)
```

### SDK核心方法

| 方法 | 签名 | 说明 | 示例 |
|------|------|------|------|
| `setConfig()` | `setConfig(config)` | 设置全局配置 | `setConfig({ host, projectId })` |
| `createAPI()` | `createAPI(options, context?)` | 创建API实例 | `createAPI({ name, resource })` |
| `api.query()` | `query(filter?, wheres?, withCount?, ...params)` | 查询数据 | `api.query({ tableId }, wheres, true, { skip, limit })` |
| `api.get()` | `get(id?, options?)` | 获取详情 | `api.get(id, { tableId })` |
| `api.save()` | `save(data?, partial?)` | 创建/更新 | `api.save({ tableId, data })` 或 `api.save({ id, tableId, data }, true)` |
| `api.delete()` | `delete(id?)` | 删除记录 | `api.delete(id)` |

## 📦 API服务层

### 认证服务

```typescript
import { login, logout, getCurrentUser } from '@/services/auth.service'

// 登录
await login(username, password)

// 登出
await logout()

// 获取当前用户
await getCurrentUser()
```

### 生产订单服务

```typescript
import {
  getProductionOrders,
  getProductionOrderDetail,
  createProductionOrder,
  updateProductionOrder,
  deleteProductionOrder
} from '@/services/production.service'

// 获取订单列表（支持分页和筛选）
const orders = await getProductionOrders({
  page: 1,
  size: 20,
  status: '生产中',
  orderType: 'batch',
  search: 'PO2503001'
})

// 获取订单详情
const detail = await getProductionOrderDetail('order-1')

// 创建订单
await createProductionOrder({
  orderNo: 'PO2503001',
  productName: '产品A',
  quantity: 1000,
  ...
})
```

### 其他服务

其他服务（质量、库存、设备、工艺）的使用方式类似，详见对应的服务文件。

## 🚀 切换到真实API

### 步骤1: 配置数据表

在AIRIOT管理后台创建对应的数据表：

#### 生产订单表 (production_orders)

| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| orderNo | string | 订单编号 | ✅ |
| productCode | string | 产品编码 | ✅ |
| productName | string | 产品名称 | ✅ |
| orderType | string | 订单类型 | ✅ |
| quantity | number | 数量 | ✅ |
| urgency | number | 紧急程度 | ✅ |
| status | string | 状态 | ✅ |
| progress | number | 进度 | ❌ |
| deliveryDate | string | 交货日期 | ✅ |

#### 其他数据表

- 质量检验表 (quality_checks)
- 库存物料表 (materials)
- 设备表 (equipments)
- 工艺路线表 (process_routes)

详细字段定义请参考 `src/types/` 目录下的类型定义文件。

### 步骤2: 关闭Mock模式

修改 `.env` 文件：

```bash
# 关闭Mock数据
VITE_USE_MOCK_DATA=false
```

### 步骤3: 重启开发服务器

```bash
npm run dev
```

### 步骤4: 测试API连接

访问登录页面，使用真实账号登录，检查是否能成功连接到AIRIOT。

## 📊 数据表查询

### 使用 @airiot/client SDK

项目使用官方SDK的API实例进行数据表操作：

```typescript
import { createCatalogAPI } from '@/lib/airiot-client'

const api = createCatalogAPI()

// 查询数据
const { items, total } = await api.query(
  { tableId: 'production_orders' },  // filter
  [                                  // wheres (过滤条件)
    { field: 'status', operator: 'eq', value: '生产中' }
  ],
  true,                              // withCount
  { skip: 0, limit: 20 }            // 分页参数
)

// 获取详情
const item = await api.get(id, { tableId: 'production_orders' })

// 创建数据
const newItem = await api.save({
  tableId: 'production_orders',
  orderNo: 'PO123',
  productName: '产品A',
  // ...其他字段
})

// 更新数据
await api.save({
  id: 'order-1',
  tableId: 'production_orders',
  status: '已完成',
}, true)  // partial=true 表示更新

// 删除数据
await api.delete('order-1')
```

### 过滤操作符

| 操作符 | 说明 | 示例 |
|--------|------|------|
| eq | 等于 | `{ field: 'status', operator: 'eq', value: '生产中' }` |
| ne | 不等于 | `{ field: 'status', operator: 'ne', value: '已完成' }` |
| gt | 大于 | `{ field: 'quantity', operator: 'gt', value: 100 }` |
| lt | 小于 | `{ field: 'quantity', operator: 'lt', value: 1000 }` |
| like | 模糊匹配 | `{ field: 'orderNo', operator: 'like', value: '%PO25%' }` |
| in | 包含于 | `{ field: 'status', operator: 'in', value: ['生产中', '已就绪'] }` |

### 分页参数

| 参数 | 说明 | 示例 |
|------|------|------|
| skip | 跳过记录数 | `skip: 0` (从第一条开始) |
| limit | 返回记录数 | `limit: 20` (返回20条) |

## ❓ 常见问题

### Q: 登录后一直显示"加载中..."？

A: 检查以下几点：
1. 确认 `.env` 配置正确
2. 检查网络连接是否正常
3. 查看浏览器控制台是否有错误信息
4. 确认AIRIOT服务器可访问
5. 确认 `initAiriotClient()` 在 main.tsx 中被调用

### Q: API返回401错误？

A: 401表示未授权，可能原因：
1. Token过期，需要重新登录
2. 项目ID配置错误
3. 用户名或密码错误
4. SDK上下文未正确初始化

### Q: 如何调试API请求？

A: 在浏览器开发者工具中：
1. 打开 Network 标签
2. 筛选 XHR 请求
3. 查看请求头、请求体、响应内容

### Q: Mock数据和真实API可以共存吗？

A: 可以。通过 `VITE_USE_MOCK_DATA` 环境变量控制：
- `true`: 使用Mock数据
- `false`: 使用真实API

每个服务内部都实现了两种模式的切换。

### Q: 如何添加新的API接口？

A: 步骤如下：
1. 在 `src/services/` 创建对应的服务文件
2. 使用 `createCatalogAPI()` 创建API实例
3. 使用SDK方法实现业务逻辑（Mock和真实API）
4. 在 `src/hooks/` 创建对应的Hook（可选）
5. 在页面组件中使用

### Q: 数据表字段和前端类型不一致怎么办？

A: 有两种解决方案：
1. 在服务层进行数据转换（推荐）
2. 修改前端类型定义以匹配数据表

建议使用方案1，保持前端代码的独立性。

### Q: @airiot/client SDK 和 axios 有什么区别？

A:
- **@airiot/client SDK**（推荐）:
  - 官方提供的TypeScript SDK
  - 自动处理token管理
  - 提供类型安全的API方法
  - 统一的错误处理
  - 支持上下文配置

- **axios**:
  - 需要手动管理token
  - 需要手动处理拦截器
  - 更多底层控制，但需要更多代码

## 📞 技术支持

如有问题，请：
1. 查看项目Issues
2. 参考AIRIOT官方文档
3. 查看 @airiot/client SDK文档
4. 联系技术支持团队

---

**最后更新**: 2025-03-17
**版本**: v2.0.0 (使用官方SDK)
