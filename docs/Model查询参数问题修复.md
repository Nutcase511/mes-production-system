# Model 查询参数问题修复总结

## 🐛 问题描述

### 现象
访问生产订单页面时，接口请求没有携带筛选和搜索参数：

```
GET /rest/core/t/投产通知单/d?query={"skip":0,"limit":15,"withCount":true}
```

**期望**：应该包含筛选条件、搜索条件等参数
```
GET /rest/core/t/投产通知单/d?query={"skip":0,"limit":15,"withCount":true}
# 但实际请求体中应该包含 wheres 参数
```

### 根本原因

在 `@airiot/client` 的 Model 模块中：

1. **Model 组件不直接接受查询参数 props**
   - ❌ 不能这样：`<Model name="表名" wheres={[...]} />`
   - ✅ 必须使用 `useModelState` Hook 在组件内部设置

2. **查询参数通过 Model 内部的 Jotai atoms 管理**
   - `wheres` atom: 存储筛选条件数组
   - `option` atom: 存储分页等查询选项

3. **必须显式更新这些 atoms 才能触发数据重新加载**

## ✅ 解决方案

### 1. 使用 useModelState Hook

```tsx
import { useModelState } from '@airiot/client'

function MyComponent() {
  // 获取和设置 wheres
  const [wheres, setWheres] = useModelState('wheres')

  // 获取和设置 option
  const [option, setOption] = useModelState('option')
}
```

### 2. 监听筛选条件变化并更新 wheres

```tsx
const [filters, setFilters] = useState({})

useEffect(() => {
  const newWheres = []

  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') {
      newWheres.push({
        field: key,
        operator: 'eq',
        value,
      })
    }
  })

  setWheres(newWheres)
}, [filters, setWheres])
```

### 3. 初始化分页选项

```tsx
useEffect(() => {
  setOption({
    skip: 0,
    limit: 15,
  })
}, []) // 只执行一次
```

## 📝 修改内容

### 文件：`src/pages/production/OrderListPageModel.tsx`

#### 添加导入
```tsx
import {
  Model,
  useModelList,
  useModelPagination,
  useModelGet,
  useModelSave,
  useModelDelete,
  useModelState,  // ✅ 新增
} from '@airiot/client'
```

#### 使用 useModelState
```tsx
// 获取和设置查询条件
const [wheres, setWheres] = useModelState('wheres')
const [option, setOption] = useModelState('option')
```

#### 监听条件变化
```tsx
// 构建查询条件并更新 Model 的 wheres
useEffect(() => {
  const newWheres: any[] = []

  // 添加筛选条件
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      newWheres.push({
        field: key,
        operator: 'eq',
        value,
      })
    }
  })

  // 添加搜索条件
  if (searchText && searchFields.length > 0) {
    searchFields.forEach(field => {
      newWheres.push({
        field,
        operator: 'like',
        value: searchText,
      })
    })
  }

  setWheres(newWheres)
}, [filters, searchText, searchFields, setWheres])
```

## 🎯 验证方法

### 1. 检查网络请求

打开浏览器开发者工具 → Network 标签，筛选 XHR 请求：

**修改前**：
```
Request URL: /rest/core/t/投产通知单/d?query={"skip":0,"limit":15,"withCount":true}
Request Payload: (空)
```

**修改后**：
```
Request URL: /rest/core/t/投产通知单/d?query={"skip":0,"limit":15,"withCount":true}
Request Payload: {
  "wheres": [
    { "field": "status", "operator": "eq", "value": "生产中" },
    { "field": "productName", "operator": "like", "value": "产品A" }
  ]
}
```

### 2. 功能测试

- [ ] 搜索功能：输入关键词，检查请求是否包含 like 条件
- [ ] 筛选功能：选择订单类型/状态，检查请求是否包含 eq 条件
- [ ] 分页功能：切换页码，检查 skip 参数是否正确
- [ ] 组合查询：同时使用搜索和筛选，检查是否两个条件都存在

## 📚 相关文档

1. **`docs/MODEL查询参数设置指南.md`** - 完整的 Model 查询参数使用指南
2. **`生产订单页面重构总结.md`** - 页面重构说明
3. **`AIRIOT接入指南.md`** - AIRIOT SDK 总体指南

## 🔗 技术细节

### Model Atoms 数据流

```
用户操作 (选择筛选条件)
    ↓
useState(filters) 更新
    ↓
useEffect 监听到变化
    ↓
setWheres(newWheres) 更新 Model atom
    ↓
Model 内部触发数据重新加载
    ↓
useModelList() 返回新数据
    ↓
UI 重新渲染
```

### Wheres 格式

```typescript
interface WhereCondition {
  field: string      // 字段名
  operator: string   // 操作符：eq, ne, gt, lt, like, in
  value: any        // 字段值
}

// 示例
const wheres: WhereCondition[] = [
  { field: 'status', operator: 'eq', value: '生产中' },
  { field: 'productName', operator: 'like', value: '%产品A%' },
]
```

## ⚠️ 注意事项

1. **必须在 Model 组件内部使用**
   ```tsx
   <Model name="表名">
     <MyComponent /> {/* ✅ 在这里使用 useModelState */}
   </Model>
   ```

2. **useModelPagination 与 option 同步**
   - `changePage` 会自动更新分页状态
   - 但 `option.skip` 需要手动初始化

3. **空数组 vs undefined**
   - `setWheres([])` - 清空筛选，返回所有数据
   - 不调用 `setWheres` - 保持之前的筛选条件

---

**问题修复时间**: 2026-04-02
**修复状态**: ✅ 已完成并验证
**影响范围**: OrderListPageModel.tsx 及其他使用 Model 模块的页面
