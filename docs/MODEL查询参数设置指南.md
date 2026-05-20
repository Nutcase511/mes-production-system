# @airiot/client Model 模块查询参数设置指南

## 📋 概述

本文档说明如何正确使用 @airiot/client 的 Model 模块设置查询参数，包括筛选条件、搜索和分页。

## 🔍 问题分析

### 原问题
接口请求没有加参数：
```
http://localhost:3000/rest/core/t/投产通知单/d?query={"skip":0,"limit":15,"withCount":true}
```

### 根本原因
Model 组件需要通过特定的 Hook 来设置查询条件，而不是简单地传递 props。

## ✅ 正确的使用方式

### 1. 使用 Model 组件

```tsx
import {
  Model,
  useModelList,
  useModelState,
} from '@airiot/client'

function MyPage() {
  return (
    <Model name="表名" modelKey="unique-key">
      <MyComponent />
    </Model>
  )
}
```

### 2. 获取和设置查询条件

在 Model 组件内部使用 `useModelState` Hook：

```tsx
function MyComponent() {
  // 获取和设置 wheres（筛选条件）
  const [wheres, setWheres] = useModelState('wheres')

  // 获取和设置 option（分页等选项）
  const [option, setOption] = useModelState('option')

  // 获取列表数据
  const { items, loading } = useModelList()
}
```

### 3. 动态更新查询条件

#### 筛选条件

```tsx
const [filters, setFilters] = useState({})

useEffect(() => {
  const newWheres = []

  // 添加筛选条件
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      newWheres.push({
        field: key,
        operator: 'eq',  // 等于
        value,
      })
    }
  })

  setWheres(newWheres)
}, [filters, setWheres])
```

#### 搜索条件

```tsx
const [searchText, setSearchText] = useState('')
const searchFields = ['productName', 'orderNo']

useEffect(() => {
  const newWheres = []

  // 添加搜索条件（模糊匹配）
  if (searchText && searchFields.length > 0) {
    searchFields.forEach(field => {
      newWheres.push({
        field,
        operator: 'like',  // 模糊匹配
        value: searchText,
      })
    })
  }

  setWheres(newWheres)
}, [searchText, setWheres])
```

#### 分页选项

```tsx
const { activePage, changePage } = useModelPagination()

useEffect(() => {
  setOption({
    skip: (activePage - 1) * 15,
    limit: 15,
  })
}, [activePage, setOption])
```

### 4. 完整示例

```tsx
import { useState, useEffect } from 'react'
import {
  Model,
  useModelList,
  useModelPagination,
  useModelState,
} from '@airiot/client'

function ProductionOrderList() {
  const [wheres, setWheres] = useModelState('wheres')
  const [option, setOption] = useModelState('option')

  const { items, loading } = useModelList()
  const { activePage, changePage } = useModelPagination()

  const [searchText, setSearchText] = useState('')
  const [filters, setFilters] = useState({})

  // 更新查询条件
  useEffect(() => {
    const newWheres: any[] = []

    // 筛选条件
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        newWheres.push({
          field: key,
          operator: 'eq',
          value,
        })
      }
    })

    // 搜索条件
    if (searchText) {
      newWheres.push({
        field: 'productName',
        operator: 'like',
        value: searchText,
      })
    }

    setWheres(newWheres)
  }, [filters, searchText, setWheres])

  // 更新分页
  useEffect(() => {
    setOption({
      skip: (activePage - 1) * 15,
      limit: 15,
    })
  }, [activePage, setOption])

  return (
    <div>
      {/* UI 组件 */}
    </div>
  )
}

export function OrderListPage() {
  return (
    <Model name="投产通知单" modelKey="production-orders-list">
      <ProductionOrderList />
    </Model>
  )
}
```

## 📊 Wheres 结构说明

### 基本格式

```typescript
interface WhereCondition {
  field: string      // 字段名
  operator: string   // 操作符
  value: any        // 值
}
```

### 常用操作符

| 操作符 | 说明 | 示例 |
|--------|------|------|
| `eq` | 等于 | `{ field: 'status', operator: 'eq', value: '生产中' }` |
| `ne` | 不等于 | `{ field: 'status', operator: 'ne', value: '已完成' }` |
| `gt` | 大于 | `{ field: 'quantity', operator: 'gt', value: 100 }` |
| `lt` | 小于 | `{ field: 'quantity', operator: 'lt', value: 1000 }` |
| `like` | 模糊匹配 | `{ field: 'productName', operator: 'like', value: '%产品A%' }` |
| `in` | 包含于 | `{ field: 'status', operator: 'in', value: ['生产中', '已就绪'] }` |

## 🔧 Model Atoms 参考

Model 组件内部使用 Jotai atoms 管理状态，可通过 `useModelState` 访问：

| Atom | 类型 | 说明 |
|------|------|------|
| `wheres` | `any[]` | 查询条件数组 |
| `option` | `object` | 查询选项（skip, limit, order等） |
| `items` | `any[]` | 列表数据 |
| `count` | `number` | 总记录数 |
| `loading` | `object` | 加载状态 |
| `selected` | `any[]` | 选中的记录 |

## ⚠️ 常见错误

### 错误 1: 直接传递 props

```tsx
// ❌ 错误
<Model name="表名" wheres={[...]} />
```

```tsx
// ✅ 正确
const [wheres, setWheres] = useModelState('wheres')
setWheres([...])
```

### 错误 2: 不使用 Model 组件

```tsx
// ❌ 错误 - 直接使用 Hooks 会导致错误
function MyPage() {
  const { items } = useModelList() // 错误！没有 Model 上下文
}
```

```tsx
// ✅ 正确 - 必须在 Model 组件内部
<Model name="表名">
  <MyComponent />
</Model>
```

### 错误 3: 忘记更新 option

```tsx
// ❌ 错误 - 只更新 wheres，不更新分页
const [wheres, setWheres] = useModelState('wheres')
setWheres(newWheres)
// 分页信息不会更新
```

```tsx
// ✅ 正确 - 同时更新 option
const [wheres, setWheres] = useModelState('wheres')
const [option, setOption] = useModelState('option')

setWheres(newWheres)
setOption({ skip: 0, limit: 15 })
```

## 🎯 最佳实践

1. **初始化查询参数**: 在模型定义的 `initialValues` 中设置默认值
2. **使用 useEffect 监听变化**: 当筛选条件变化时自动更新 wheres
3. **重置筛选**: 清空筛选时设置 `setWheres([])`
4. **分页同步**: 确保 `option.skip` 和 `option.limit` 与分页组件同步

## 📚 相关文档

- `AIRIOT接入指南.md` - AIRIOT SDK 使用指南
- `node_modules/@airiot/client/dist/index.d.ts` - 类型定义
- `src/models/index.ts` - 数据模型定义示例

---

**创建时间**: 2026-04-02
**版本**: v1.0
**状态**: ✅ 已验证
