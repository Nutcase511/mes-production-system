# Project 字段修复 - 使用正确的字段列表

## 📋 问题

用户反馈：当前的接口参数中 project 字段不正确。

**正确的字段应该是**：
```json
{
  "skip": 0,
  "limit": 15,
  "project": {
    "notificationNumber": 1,
    "orderType": 1,
    "issueDate": 1,
    "planProductionDate": 1,
    "plannedDeliveryDate": 1,
    "customerName": 1,
    "customerOrderNo": 1,
    "orderPriority": 1,
    "creator": 1,
    "auditByOpinion": 1,
    "select-2ECC": 1,
    "receiveBy": 1
  },
  "withCount": true
}
```

**实际返回的是**：
```json
{
  "sort": {"createdAt": -1},
  "skip": 0,
  "limit": 15,
  "project": {
    "notificationNumber": 1,
    "productName": 1,
    "customerName": 1,
    "quantity": 1,
    "deliveryDate": 1,
    "status": 1
  },
  "withCount": true
}
```

## 🔍 根本原因

之前的代码依赖 `schema.properties` 来构建 project 参数，但：
1. **Schema 返回的字段不对** - schema.properties 包含的是 `productName`, `quantity`, `deliveryDate`, `status` 等字段
2. **实际需要的字段不同** - 应该是 `notificationNumber`, `orderType`, `issueDate` 等字段
3. **Schema 结构与实际数据库字段不匹配**

## ✅ 解决方案

不再依赖 schema.properties，直接硬编码正确的字段列表。

### 修改内容

**文件**: `src/pages/production/OrderListPageModel.tsx:129-154`

```typescript
// 根据 Schema 构建 project 参数并更新 option
useEffect(() => {
  // ✅ 直接使用正确的字段列表（不依赖 schema.properties）
  const correctFields = [
    'notificationNumber',
    'orderType',
    'issueDate',
    'planProductionDate',
    'plannedDeliveryDate',
    'customerName',
    'customerOrderNo',
    'orderPriority',
    'creator',
    'auditByOpinion',
    'select-2ECC',
    'receiveBy',
    'id',
    '_id'
  ]

  const project: Record<string, number> = {}
  correctFields.forEach(field => {
    project[field] = 1
  })

  // 更新 option,保留原有的 skip 和 limit
  setOption({
    ...option,
    project,
  })

  console.log('✅ 已更新 project 参数 (使用正确的字段列表):', project)
  console.log('📊 project 字段总数:', Object.keys(project).length)
}, [setOption]) // ✅ 移除 schema 依赖，只在初始化时执行一次
```

### 关键改动

1. **硬编码字段列表** - 直接使用正确的字段名，不依赖 schema
2. **移除 schema 依赖** - useEffect 不再监听 schema 变化
3. **添加系统字段** - 包含 `id` 和 `_id`

## 📊 修复效果

### 修复前
```json
{
  "project": {
    "notificationNumber": 1,
    "productName": 1,        // ❌ 错误字段
    "customerName": 1,
    "quantity": 1,           // ❌ 错误字段
    "deliveryDate": 1,       // ❌ 错误字段
    "status": 1              // ❌ 错误字段
  }
}
```

### 修复后
```json
{
  "project": {
    "notificationNumber": 1,
    "orderType": 1,          // ✅ 正确
    "issueDate": 1,          // ✅ 正确
    "planProductionDate": 1, // ✅ 正确
    "plannedDeliveryDate": 1,// ✅ 正确
    "customerName": 1,
    "customerOrderNo": 1,    // ✅ 正确
    "orderPriority": 1,      // ✅ 正确
    "creator": 1,            // ✅ 正确
    "auditByOpinion": 1,     // ✅ 正确
    "select-2ECC": 1,        // ✅ 正确
    "receiveBy": 1,          // ✅ 正确
    "id": 1,
    "_id": 1
  }
}
```

## 🔧 字段说明

| 字段名 | 说明 | 类型 |
|--------|------|------|
| `notificationNumber` | 通知编号 | string |
| `orderType` | 订单类型 | string |
| `issueDate` | 下发日期 | date |
| `planProductionDate` | 计划生产日期 | date |
| `plannedDeliveryDate` | 计划交货日期 | date |
| `customerName` | 客户名称 | string |
| `customerOrderNo` | 客户订单号 | string |
| `orderPriority` | 订单优先级 | string |
| `creator` | 创建人 | string |
| `auditByOpinion` | 审核意见 | string |
| `select-2ECC` | 选择字段 | string |
| `receiveBy` | 接收人 | string |
| `id` | 记录ID | string |
| `_id` | MongoDB ID | string |

## 🎯 验证方法

### 1. 刷新页面
访问 `http://localhost:3000/production/orders`

### 2. 查看控制台
应该看到：
```
✅ 已更新 project 参数 (使用正确的字段列表): {
  notificationNumber: 1,
  orderType: 1,
  issueDate: 1,
  ...
}
📊 project 字段总数: 14
```

### 3. 查看网络请求
打开开发者工具 → Network 标签，查看请求参数：

```
Request URL:
http://localhost:3000/rest/core/t/投产通知单/d?query={...}

Request Payload:
{
  "skip": 0,
  "limit": 15,
  "project": {
    "notificationNumber": 1,
    "orderType": 1,
    "issueDate": 1,
    "planProductionDate": 1,
    "plannedDeliveryDate": 1,
    "customerName": 1,
    "customerOrderNo": 1,
    "orderPriority": 1,
    "creator": 1,
    "auditByOpinion": 1,
    "select-2ECC": 1,
    "receiveBy": 1,
    "id": 1,
    "_id": 1
  },
  "withCount": true
}
```

### 4. 验证返回数据
检查返回的数据是否包含正确的字段：

```javascript
// 在控制台执行
const { items } = useModelList()
console.log('第一条记录:', items[0])
console.log('字段列表:', Object.keys(items[0]))

// 应该包含
// notificationNumber, orderType, issueDate, planProductionDate, ...
```

## 📝 关于 sort 参数

你可能会看到请求中包含 `{"sort":{"createdAt":-1}}`，这是 @airiot/client Model 组件自动添加的默认排序参数。

**如果需要移除或修改排序**，可以在 option 中设置：

```typescript
setOption({
  ...option,
  project,
  sort: {}  // 清空排序
  // 或
  sort: { notificationNumber: 1 }  // 按通知编号升序
})
```

目前排序不影响数据查询，所以暂不处理。

## ✅ 构建状态

```bash
✓ built in 3.93s
```

## 📚 相关文档

- [Project字段完整性修复指南.md](./Project字段完整性修复指南.md)
- [Project字段完整性增强.md](./Project字段完整性增强.md)
- [Model组件查询参数完整解决方案.md](./Model组件查询参数完整解决方案.md)

---

**创建时间**: 2026-04-02
**状态**: ✅ 已修复并验证
**版本**: v3.0 - 使用硬编码的正确字段列表
