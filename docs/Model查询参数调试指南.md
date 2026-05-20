# Model 查询参数调试指南

## 🔍 问题现象

查询表数据的接口没有携带筛选和搜索参数：
```
http://localhost:3000/rest/core/t/投产通知单/d?query={"skip":0,"limit":15,"withCount":true}
```

## ✅ 已实施的修复

### 1. 在 Model 组件上设置 initialValues

```tsx
<Model
  name={tableId}
  modelKey="production-orders-list"
  initialValues={{
    wheres: [],      // 初始筛选条件（空数组）
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
  }

  console.log('🔍 设置查询条件 (wheres):', newWheres)
  setWheres(newWheres)
}, [filters, searchText, searchFields, setWheres])
```

## 🧪 调试步骤

### 第一步：打开浏览器控制台

1. 打开 Chrome DevTools (F12)
2. 切换到 **Console** 标签
3. 访问：`http://localhost:3000/production/orders-model`

### 第二步：检查 wheres 是否被设置

在控制台中应该看到类似的日志：
```
🔍 设置查询条件 (wheres): []
```

当你选择筛选条件或输入搜索内容时，应该看到：
```
🔍 设置查询条件 (wheres): [
  { field: "status", operator: "eq", value: "生产中" }
]
```

### 第三步：检查网络请求

1. 切换到 **Network** 标签
2. 筛选 **XHR** 请求
3. 找到 `/rest/core/t/投产通知单/d` 请求
4. 点击查看详情

**检查 Request URL**：
```
?query={"skip":0,"limit":15,"withCount":true}
```

**检查 Request Payload**（可能为空）：
```
Request Payload: (空)
```

### 第四步：测试筛选和搜索

#### 测试筛选功能
1. 选择"订单类型"为"批产"
2. 检查控制台日志：
   ```
   🔍 设置查询条件 (wheres): [
     { field: "orderType", operator: "eq", value: "batch" }
   ]
   ```
3. 检查新的网络请求

#### 测试搜索功能
1. 在搜索框输入"产品A"
2. 检查控制台日志：
   ```
   🔍 设置查询条件 (wheres): [
     { field: "productName", operator: "like", value: "产品A" }
   ]
   ```
3. 检查新的网络请求

## 🔧 可能的问题和解决方案

### 问题 1: wheres 被设置，但 API 请求没有参数

**原因**: @airiot/client 的 Model 可能需要通过特定方式传递参数到 API

**解决方案**: 检查是否需要使用 **TableModel** 而不是 **Model**

```tsx
// 尝试使用 TableModel
<TableModel
  tableId={tableId}
  initQuery={{ wheres, option }}
>
  <ProductionOrderListContent />
</TableModel>
```

### 问题 2: API 请求格式不对

**原因**: 可能需要将参数放在请求体而不是 URL 参数中

**解决方案**: 检查实际的请求格式，可能需要自定义 API 实例

### 问题 3: wheres 格式不对

**原因**: 后端可能期望不同的 wheres 格式

**解决方案**: 检查后端 API 文档，确认正确的格式

```typescript
// 可能的格式
// 格式1：数组
[{ field: "status", operator: "eq", value: "生产中" }]

// 格式2：对象
{ status: { eq: "生产中" } }

// 格式3：字符串
"status=生产中"
```

## 📊 验证清单

请按以下步骤逐一验证：

- [ ] 控制台显示 `🔍 设置查询条件 (wheres):` 日志
- [ ] 选择筛选条件后，wheres 数组有内容
- [ ] 搜索后，wheres 数组有内容
- [ ] Network 标签中能看到新的 XHR 请求
- [ ] 请求 URL 中包含正确的 skip 和 limit
- [ ] **请求体或 URL 中包含 wheres 参数** ⭐ 重点

## 🎯 下一步行动

### 如果 wheres 在请求中缺失

1. **检查 Model 组件实现**
   - 查看 `@airiot/client` 源码
   - 确认 Model 如何将 wheres 传递给 API

2. **尝试使用 TableModel**
   - TableModel 有 `initQuery` 参数
   - 可能有更好的查询参数支持

3. **自定义 API 实例**
   - 不使用 Model 的默认 API
   - 手动创建 API 实例并传递参数

### 临时解决方案

如果 Model 的查询参数传递有问题，可以回退到使用 `useTableData` Hook：

```tsx
// 使用原有的方式
const { data, loading, ... } = useTableData(tableId, {
  searchFields,
  filters,  // ✅ 这个方式已经验证可用
  ...
})
```

## 📝 需要检查的关键点

1. ✅ `useModelState('wheres')` 是否返回正确的 setter
2. ✅ `setWheres(newWheres)` 是否被调用
3. ❓ Model 组件内部是否读取 wheres atom
4. ❓ API 请求时是否使用 wheres atom 的值
5. ❓ 请求参数的格式是否正确

---

**创建时间**: 2026-04-02
**调试状态**: 🔍 进行中
**下一步**: 验证 wheres 是否出现在 API 请求中
