# Model 查询参数问题完整分析和解决方案

## 🐛 问题描述

**现象**: 访问生产订单页面时，查询接口没有携带筛选和搜索参数

**请求URL**:
```
http://localhost:3000/rest/core/t/投产通知单/d?query={"skip":0,"limit":15,"withCount":true}
```

**期望**: 请求应该包含 wheres 参数用于筛选和搜索

## 🔍 根本原因分析

### @airiot/client Model 组件的工作原理

1. **Model 组件内部使用 Jotai atoms 管理状态**
   ```typescript
   interface ModelAtoms {
     wheres: WritableAtom<any[], any, void>      // 筛选条件
     option: WritableAtom<any, any, void>        // 分页选项
     items: WritableAtom<any[], any, void>       // 列表数据
     // ... 其他 atoms
   }
   ```

2. **Model 不会自动将查询参数传递给 API**
   - 需要通过 `useModelState` Hook 访问和更新 atoms
   - API 实例需要手动配置才能读取这些 atoms

3. **查询参数的传递流程**
   ```
   用户操作 → useState(filters)
           ↓
   useEffect 监听
           ↓
   setWheres(newWheres) 更新 atom
           ↓
   ❓ 这里可能有问题：API 是否读取 wheres atom？
           ↓
   API 请求发送
   ```

### 可能的问题点

1. **Model 组件没有将 wheres atom 暴露给 API**
2. **API 实例没有配置读取 wheres atom**
3. **请求格式不匹配后端期望**

## ✅ 已实施的修复

### 1. 在 Model 组件上设置 initialValues

```tsx
<Model
  name={tableId}
  modelKey="production-orders-list"
  initialValues={{
    wheres: [],      // 初始筛选条件
    option: {        // 初始分页选项
      skip: 0,
      limit: 15,
    },
  }}
>
```

### 2. 使用 useModelState 管理查询条件

```tsx
const [wheres, setWheres] = useModelState('wheres')
const [option, setOption] = useModelState('option')
```

### 3. 监听筛选条件变化并更新

```tsx
useEffect(() => {
  const newWheres: any[] = []

  // 添加筛选条件
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') {
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
  })

  console.log('🔍 设置查询条件 (wheres):', newWheres)
  setWheres(newWheres)
}, [filters, searchText, searchFields, setWheres])
```

## 🧪 测试验证

### 访问测试页面

```
http://localhost:3000/test/model-query
```

### 测试步骤

1. **打开浏览器控制台** (F12)
2. **点击"设置测试 wheres"按钮**
3. **查看控制台日志**：
   ```
   🔧 设置新的 wheres: [{ field: 'status', operator: 'eq', value: '生产中' }]
   === Model Query Test ===
   1. 当前 wheres: [{ field: 'status', operator: 'eq', value: '生产中' }]
   2. 当前 option: { skip: 0, limit: 5 }
   ```
4. **切换到 Network 标签**
5. **查找新的 XHR 请求**
6. **检查请求是否包含 wheres 参数** ⭐

### 预期结果

#### ✅ 情况1: wheres 在请求体中

```http
POST /rest/core/t/投产通知单/d?query={"skip":0,"limit":15}
Content-Type: application/json

{
  "wheres": [
    { "field": "status", "operator": "eq", "value": "生产中" }
  ]
}
```

#### ✅ 情况2: wheres 在 URL 参数中

```http
GET /rest/core/t/投产通知单/d?query={"skip":0,"limit":15,"wheres":[...]}
```

#### ❌ 情况3: wheres 不在请求中（当前问题）

```http
GET /rest/core/t/投产通知单/d?query={"skip":0,"limit":15,"withCount":true}
# 没有 wheres 参数
```

## 🔧 解决方案

### 方案 A: 检查 Model 是否正确传递参数（推荐先测试）

1. **使用测试页面验证**
   - 访问 `/test/model-query`
   - 检查控制台和网络请求
   - 确认 wheres 是否出现在请求中

2. **如果 wheres 在请求中**
   - ✅ Model 工作正常
   - 问题可能是筛选条件没有正确设置

3. **如果 wheres 不在请求中**
   - ❌ Model 没有正确传递参数
   - 需要使用方案 B 或 C

### 方案 B: 使用 TableModel 替代 Model

```tsx
import { TableModel } from '@airiot/client'

<TableModel
  tableId={tableId}
  initQuery={{ wheres, option }}
  initialValues={{ wheres, option }}
>
  <ProductionOrderListContent />
</TableModel>
```

**优点**:
- TableModel 有 `initQuery` 参数专门处理查询
- 可能有更好的查询参数支持

**缺点**:
- 需要重构代码
- TableModel 的 API 可能不同

### 方案 C: 回退到 useTableData Hook（已验证可用）

```tsx
import { useTableData } from '@/hooks'

const {
  data,
  loading,
  pagination,
  filters,
  setFilter,
  searchText,
  setSearchText,
  // ...
} = useTableData(tableId, {
  searchFields,
  filters,  // ✅ 这个方式已经验证可以正确传递参数
})
```

**优点**:
- ✅ 已经验证可用
- ✅ 可以正确传递查询参数
- ✅ 代码稳定

**缺点**:
- 不是使用 Model 模块
- 需要手动管理状态

### 方案 D: 自定义 API 实例（高级）

```tsx
import { createAPI } from '@airiot/client'

const api = createAPI({
  resource: `core/t/${tableId}/d`,
})

// 手动构建请求
const { items, total } = await api.query(
  { skip: 0, limit: 15 },
  wheres,  // ✅ 直接传递 wheres
  true
)
```

**优点**:
- 完全控制请求参数
- 灵活性高

**缺点**:
- 失去 Model 模块的优势
- 需要手动管理更多状态

## 📊 决策树

```
Model 查询参数问题
    ↓
使用测试页面验证
    ↓
┌─────────────┬─────────────┐
│             │             │
wheres 在请求中  wheres 不在请求中
│             │
├─────────────┤             │
✅ Model 正常  ❌ Model 有问题
│             │
│             ↓
│         检查筛选逻辑
│             ↓
│         ┌───┴───┐
│         │       │
│      使用     使用
│    TableModel  useTableData
│         │       │
└─────────┴───────┘
```

## 🎯 立即行动

### 第一步：测试验证

访问测试页面并观察结果：
```
http://localhost:3000/test/model-query
```

### 第二步：根据测试结果选择方案

- **如果测试页面显示 wheres 在请求中** → 检查 OrderListPageModel 的筛选逻辑
- **如果测试页面显示 wheres 不在请求中** → 使用方案 B、C 或 D

### 第三步：实施修复

根据选择的方案修改代码并测试

## 📝 相关文档

1. **`docs/MODEL查询参数调试指南.md`** - 详细的调试步骤
2. **`docs/MODEL查询参数设置指南.md`** - Model 使用指南
3. **`src/pages/test/ModelQueryTest.tsx`** - 测试页面代码

## 🔗 相关文件

- `src/pages/production/OrderListPageModel.tsx` - 生产订单页面（Model 版本）
- `src/pages/production/OrderListPage.tsx` - 生产订单页面（useTableData 版本，已验证可用）
- `src/hooks/useTableData.ts` - 自定义 Hook（已验证可用）
- `src/models/index.ts` - Model 注册

---

**创建时间**: 2026-04-02
**问题状态**: 🔍 调试中
**下一步**: 使用测试页面验证 wheres 是否在 API 请求中
