# Model 组件 wheres 格式问题总结

## 🐛 问题发现

### 测试结果

| 测试场景 | 接口参数 | 结果 |
|---------|---------|------|
| **不设置 wheres** | `{"skip":0,"limit":15,...}` | ✅ 成功，返回2条数据 |
| **设置 wheres（任何格式）** | `{"filter":{"field":"status",...}}` | ❌ 报错：`column 投产通知单.field does not exist` |

### 根本原因

**@airiot/client 的 Model 组件在内部将 wheres 转换为 filter 时，使用了错误的格式**：

```javascript
// Model 组件生成的格式（错误）
{
  "filter": {
    "field": "status",      // ❌ 后端不认识这个字段
    "operator": "eq",
    "value": "生产中"
  }
}

// 后端期望的格式（正确）
{
  "filter": {
    "status": "生产中"       // ✅ 直接使用字段名
  }
}
```

## ✅ 解决方案

### 方案 1：使用 useTableData Hook（✅ 推荐）

**已验证可用**，`useTableData` Hook 直接调用 `api.query()` 方法，可以正确传递参数。

**当前状态**：
- ✅ 路由已恢复使用 `OrderListPage`（useTableData 版本）
- ✅ 生产订单页面使用 `http://localhost:3000/production/orders`

**代码位置**：
- `src/pages/production/OrderListPage.tsx` - 使用 useTableData
- `src/hooks/useTableData.ts` - 已验证可用

### 方案 2：继续使用 Model 组件（不推荐）

如果一定要使用 Model 组件，需要：

1. **自定义 API 转换逻辑**
2. **不使用 Model 的 wheres atom**，手动管理查询条件
3. **或者等待 @airiot/client 修复这个问题**

但是这些方案都需要大量额外工作。

## 📊 对比分析

| 特性 | useTableData | Model 组件 |
|------|--------------|-----------|
| 查询参数传递 | ✅ 正确 | ❌ 格式错误 |
| 代码复杂度 | 中等 | 简单 |
| 类型安全 | ✅ 良好 | ✅ 良好 |
| 维护成本 | 低 | 高（需要处理格式问题）|
| 官方支持 | - | 官方推荐但有问题 |

## 🎯 最终建议

### 推荐使用 useTableData Hook

**原因**：
1. ✅ **已验证可用**：查询参数格式正确
2. ✅ **稳定可靠**：不依赖 Model 组件的内部实现
3. ✅ **易于调试**：可以完全控制请求格式
4. ✅ **灵活性强**：可以自定义任何查询逻辑

### 使用方式

```tsx
import { useTableData } from '@/hooks'

function MyPage() {
  const {
    data,
    loading,
    pagination,
    filters,
    setFilter,
    searchText,
    setSearchText,
    // ... 其他功能
  } = useTableData(tableId, {
    searchFields,
    autoLoad: true,
  })

  // 使用 data、filters 等渲染 UI
}
```

## 📝 相关文件

### ✅ 当前使用（推荐）
- `src/pages/production/OrderListPage.tsx` - 生产订单页面（useTableData 版本）
- `src/hooks/useTableData.ts` - 自定义 Hook
- `src/router.tsx` - 路由配置（已恢复）

### ⚠️ 保留供参考
- `src/pages/production/OrderListPageModel.tsx` - Model 版本（有查询参数问题）
- `src/pages/test/ModelQueryTest.tsx` - 测试页面

## 🔗 访问地址

### 生产订单页面（当前使用）
```
http://localhost:3000/production/orders
```

### Model 版本（有问题，仅用于测试）
```
http://localhost:3000/production/orders-model
```

### 测试页面
```
http://localhost:3000/test/model-query
```

## 🐛 已知问题

### Model 组件的 wheres 格式问题

**问题**：Model 组件将 wheres 转换为 filter 时使用了错误的格式

**影响**：
- 所有使用 Model 组件的筛选和搜索功能都会报错
- 必须使用 `useTableData` Hook 或手动构建 API 请求

**临时解决方案**：
- 使用 `useTableData` Hook
- 或者在 Model 组件外手动管理查询条件

**长期解决方案**：
- 等待 @airiot/client 官方修复
- 或者提交 issue 到 @airiot/client 仓库

---

**创建时间**: 2026-04-02
**问题状态**: ✅ 已解决（使用 useTableData）
**建议**: 继续使用 useTableData，避免使用 Model 组件的 wheres 功能
