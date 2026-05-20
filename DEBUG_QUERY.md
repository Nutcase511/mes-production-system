# 查询接口调试指南

## 问题：查询接口缺少 project 字段

### 步骤 1：打开浏览器开发者工具
1. 按 F12 打开开发者工具
2. 切换到 **Network** 标签页

### 步骤 2：执行查询操作
1. 打开生产计划列表页面：`http://localhost:3003/production/orders`
2. 在过滤器中输入查询条件（可选）
3. 点击"搜索"按钮

### 步骤 3：查看网络请求
在 Network 标签页中，找到查询请求：
- 请求 URL 类似：`/core/t/生产计划/d?query=...`
- 请求方法：GET

### 步骤 4：检查请求参数
点击该请求，查看：
1. **Query String Parameters** - 查看查询参数
2. **Response** - 查看返回的数据

### 预期结果
请求参数应该包含：
```json
{
  "filter": {...},
  "projectAll": true,
  "limit": 10
}
```

### 如果缺少 projectAll
请提供以下信息：
1. 实际的请求参数（复制 Query String）
2. 控制台是否有错误信息
3. TableView 组件的配置代码

## 临时解决方案

如果确认缺少 project 字段，可以在页面中手动设置：

```tsx
// 在 OrderListPage.tsx 中
<TableView
  tableId={tableId}
  projectAll={true}
  initQuery={true}
  queryFields={['orderNo', 'productName', 'quantity']} // 指定字段
>
```

或者检查 `initialValues` 是否正确传递到了 TableModel。
