# @airiot/client Model 查询参数完整解决方案

## 🎉 成功解决！

经过反复测试和调试，终于找到了 **@airiot/client Model 组件** 正确的查询参数格式。

---

## 🔍 问题根源

### 核心发现

**Model 组件期望的数据结构**：
```typescript
{
  wheres: {
    filter: {                    // 🔑 关键：必须有一层 filter 包装！
      status: '生产中',        // 实际的筛选条件
      orderType: '1'
    }
  }
}
```

**生成的 API 请求参数**：
```json
{
  "skip": 0,
  "limit": 15,
  "filter": {                   // ✅ filter 是对象
    "status": "生产中",         // ✅ 直接是字段名:值
    "orderType": "1"
  },
  "withCount": true
}
```

---

## 📊 正确的查询格式

### 1. 等值查询

```typescript
// 设置
setWheres({
  filter: {
    status: '生产中',
    orderType: '1'
  }
})

// 请求参数
{
  "filter": {
    "status": "生产中",
    "orderType": "1"
  }
}
```

### 2. 范围查询

```typescript
// 设置
setWheres({
  filter: {
    issueDate: {
      "$gte": "2026-04-01",
      "$lte": "2026-04-30"
    }
  }
})

// 请求参数
{
  "filter": {
    "issueDate": {
      "$gte": "2026-04-01",
      "$lte": "2026-04-30"
    }
  }
}
```

### 3. 模糊查询

```typescript
// 设置
setWheres({
  filter: {
    productName: { "$like": "%产品A%" }
  }
})

// 请求参数
{
  "filter": {
    "productName": {
      "$like": "%产品A%"
    }
  }
}
```

### 4. 组合查询

```typescript
// 设置
setWheres({
  filter: {
    status: '生产中',
    orderType: '1',
    issueDate: {
      "$gte": "2026-04-01",
      "$lte": "2026-04-30"
    }
  }
})

// 请求参数
{
  "filter": {
    "status": "生产中",
    "orderType": "1",
    "issueDate": {
      "$gte": "2026-04-01",
      "$lte": "2026-04-30"
    }
  }
}
```

---

## 🔧 实现代码

### Model 组件初始化

```tsx
<Model
  name="投产通知单"
  modelKey="production-orders-list"
  initialValues={{
    wheres: {
      filter: {}  // 初始化空的 filter
    },
    option: {
      skip: 0,
      limit: 15,
    }
  }}
>
  <MyComponent />
</Model>
```

### 使用 useModelState Hook

```tsx
function MyComponent() {
  const [wheres, setWheres] = useModelState('wheres')

  const handleFilterChange = (filters) => {
    const filterConditions = {
      status: filters.status,
      orderType: filters.orderType
    }

    // ✅ 关键：包装一层 filter
    setWheres({
      filter: filterConditions
    })
  }

  return <div>...</div>
}
```

### 完整示例：生产订单页面

```tsx
export function ProductionOrderListContent() {
  const [wheres, setWheres] = useModelState('wheres')
  const [filters, setFilters] = useState({})

  // 当筛选条件变化时
  useEffect(() => {
    const filterConditions: any = {}

    // 添加筛选条件
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filterConditions[key] = value
      }
    })

    // ✅ 包装一层 filter
    setWheres({
      filter: filterConditions
    })
  }, [filters, setWheres])

  return <div>...</div>
}
```

---

## ⚠️ 常见错误

### ❌ 错误 1：缺少 filter 包装层

```typescript
// ❌ 错误
setWheres({
  status: '生产中'
})

// 结果：filter = "生产中" (字符串，不是对象)
```

### ❌ 错误 2：使用数组格式

```typescript
// ❌ 错误
setWheres([
  { field: 'status', operator: 'eq', value: '生产中' }
])

// 结果：后端报错 "column 投产通知单.field does not exist"
```

### ❌ 错误 3：使用 field/operator/value 结构

```typescript
// ❌ 错误
setWheres({
  field: 'status',
  operator: 'eq',
  value: '生产中'
})

// 结果：filter = { field: 'status', operator: 'eq', value: '生产中' }
// 后端不认识这个格式
```

---

## 🎯 操作符参考

| 操作符 | 格式 | 示例 |
|--------|------|------|
| 等于 | `{ fieldName: value }` | `{ status: '生产中' }` |
| 大于 | `{ fieldName: { "$gt": value } }` | `{ quantity: { "$gt": 100 } }` |
| 小于 | `{ fieldName: { "$lt": value } }` | `{ quantity: { "$lt": 1000 } }` |
| 大于等于 | `{ fieldName: { "$gte": value } }` | `{ quantity: { "$gte": 100 } }` |
| 小于等于 | `{ fieldName: { "$lte": value } }` | `{ quantity: { "$lte": 1000 } }` |
| 模糊匹配 | `{ fieldName: { "$like": "%value%" } }` | `{ productName: { "$like": "%产品%" }` |
| 在数组中 | `{ fieldName: { "$in": [v1, v2] } }` | `{ status: { "$in": ["生产中", "已完成"] }` |

---

## 📚 相关文件

### ✅ 正在使用的文件

1. **`src/pages/production/OrderListPageModel.tsx`**
   - 使用 Model 组件
   - 使用正确的 filter 格式
   - 已验证可用

2. **`src/pages/test/ModelQueryTest.tsx`**
   - 测试页面
   - 包含多种查询格式示例
   - 可用于调试

### 📝 参考文件

3. **`src/pages/production/OrderListPage.tsx`**
   - 使用 useTableData Hook（旧版本）
   - 已验证可用，作为备用方案

4. **`src/pages/production/OrderListPageManual.tsx`**
   - 手动 API 调用版本
   - 完全绕过 Model 组件

---

## 🚀 使用建议

### 推荐：使用 Model 组件（已修复）

**优点**：
- ✅ 官方推荐方式
- ✅ 代码简洁
- ✅ 状态管理自动化
- ✅ 类型安全

**使用方式**：
```tsx
<Model name="表名" modelKey="unique-key" initialValues={{...}}>
  <YourComponent />
</Model>
```

### 备用：useTableData Hook

如果 Model 组件还有问题，可以使用 `useTableData` Hook：

```tsx
const {
  data,
  loading,
  filters,
  setFilter,
  searchText,
  setSearchText
} = useTableData(tableId, {
  searchFields,
  autoLoad: true,
})
```

---

## 🔗 访问地址

### 生产订单页面（当前使用）

```
http://localhost:3000/production/orders
```

### 生产订单页面（Model 版本）

```
http://localhost:3000/production/orders-model
```

### 测试页面

```
http://localhost:3000/test/model-query
```

---

## 📝 总结

### 关键要点

1. ✅ **必须有一层 `filter` 包装**
   ```typescript
   { filter: { ... } }
   ```

2. ✅ **筛选条件直接放在 filter 对象内**
   ```typescript
   {
     filter: {
       fieldName: value
     }
   }
   ```

3. ✅ **操作符使用 MongoDB 风格**
   ```typescript
   { "$gte": "...", "$lte": "..." }
   ```

4. ✅ **使用 `useModelState('wheres')` 管理查询条件**
   ```typescript
   const [wheres, setWheres] = useModelState('wheres')
   ```

---

**创建时间**: 2026-04-02
**状态**: ✅ 已验证并测试通过
**版本**: v2.0 - 使用 Model 组件的正确格式
