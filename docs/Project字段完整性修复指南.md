# Project 字段完整性修复指南

## 📋 问题描述

在使用 @airiot/client Model 组件查询数据时,发现返回的字段不完整,缺少一些必要的系统字段。

## 🔍 问题根源

### 1. `buildProjectFromSchema` 函数不完整

**之前的实现**:
```typescript
export function buildProjectFromSchema(schema: TableSchema): Record<string, number> {
  const project: Record<string, number> = {}
  const schemaFields = schema.schema || schema

  if (schemaFields.properties && typeof schemaFields.properties === 'object') {
    const fieldKeys = Object.keys(schemaFields.properties)
    fieldKeys.forEach(field => {
      project[field] = 1
    })
  }

  return project  // ❌ 缺少系统字段!
}
```

**问题**:
- 只包含 `schema.properties` 中定义的字段
- 缺少系统必要字段: `id`, `_id` 等
- 可能导致数据操作时缺少主键

### 2. Model 组件未设置 project 参数

**之前的代码**:
```typescript
<Model
  name="投产通知单"
  modelKey="production-orders-list"
  initialValues={{
    wheres: { filter: {} },
    option: {
      skip: 0,
      limit: 15,
      // ❌ 缺少 project 参数!
    }
  }}
>
```

**问题**:
- Model 组件不会自动添加 project 参数
- 需要手动在 Schema 加载后构建并设置

## ✅ 解决方案

### 1. 改进 `buildProjectFromSchema` 函数

**新实现** (`src/services/production.service.ts`):
```typescript
export function buildProjectFromSchema(schema: TableSchema): Record<string, number> {
  const project: Record<string, number> = {}

  if (!schema) {
    return project
  }

  // ✅ 添加系统必要字段
  project['id'] = 1
  project['_id'] = 1

  const schemaFields = schema.schema || schema

  if (!schemaFields || typeof schemaFields !== 'object') {
    return project
  }

  // 添加 Schema 中定义的所有字段
  if (schemaFields.properties && typeof schemaFields.properties === 'object') {
    const fieldKeys = Object.keys(schemaFields.properties)
    fieldKeys.forEach(field => {
      project[field] = 1
    })
  }

  console.log('📋 构建的 project 参数:', project)
  return project
}
```

**改进点**:
- ✅ 添加 `id` 字段 (主键)
- ✅ 添加 `_id` 字段 (MongoDB ID)
- ✅ 保留所有 Schema 定义的字段
- ✅ 添加日志输出,便于调试

### 2. 在 Model 组件中动态设置 project

**新实现** (`src/pages/production/OrderListPageModel.tsx`):

```typescript
function ProductionOrderListContent() {
  const [wheres, setWheres] = useModelState('wheres')
  const [option, setOption] = useModelState('option')  // ✅ 获取 option

  const [schema, setSchema] = useState<any>(null)

  // 加载 Schema
  useEffect(() => {
    const loadSchema = async () => {
      const url = `${baseURL}/rest/core/t/schema/${encodeURIComponent(tableId)}`
      const response = await fetch(url, { method: 'GET', headers: getHeaders() })
      const schemaData = await response.json()
      setSchema(schemaData)
      console.log('✅ Schema 加载成功:', schemaData)
    }
    loadSchema()
  }, [tableId])

  // ✅ 根据 Schema 构建 project 参数并更新 option
  useEffect(() => {
    if (schema && schema.schema) {
      const project: Record<string, number> = {}

      // 添加系统字段
      project['id'] = 1
      project['_id'] = 1

      // 添加 Schema 中定义的所有字段
      const schemaFields = schema.schema
      if (schemaFields.properties && typeof schemaFields.properties === 'object') {
        Object.keys(schemaFields.properties).forEach(field => {
          project[field] = 1
        })
      }

      // 更新 option,保留原有的 skip 和 limit
      setOption({
        ...option,
        project,
      })

      console.log('✅ 已更新 project 参数:', project)
    }
  }, [schema, setOption])

  return <div>...</div>
}
```

**关键点**:
1. 使用 `useModelState('option')` 获取和设置 option
2. 在 Schema 加载完成后,构建 project 参数
3. 使用 `setOption` 更新,保留原有的分页参数
4. 添加日志输出,便于调试

## 📊 Project 参数格式

### 完整示例

```json
{
  "skip": 0,
  "limit": 15,
  "project": {
    "id": 1,
    "_id": 1,
    "serial-number-1773": 1,
    "text-B2EF": 1,
    "done": 1,
    "text-1C5B": 1,
    "number-4DE1": 1,
    "text-7CC5": 1,
    "text-F185": 1,
    "upload-single-AE62": 1
  },
  "filter": {
    "status": "生产中"
  },
  "withCount": true
}
```

### 字段说明

| 字段 | 类型 | 说明 | 必需 |
|------|------|------|------|
| `id` | number | 记录主键 | ✅ 是 |
| `_id` | number | MongoDB ID | ✅ 是 |
| `serial-number-1773` | number | 订单编号 | ✅ 是 |
| `text-B2EF` | number | 订单来源 | ✅ 是 |
| `done` | number | 订单状态 | ✅ 是 |
| ... | ... | 其他 Schema 字段 | ✅ 是 |

## 🎯 验证方法

### 1. 查看控制台日志

打开浏览器控制台,应该能看到:

```
✅ Schema 加载成功: { schema: { properties: {...} } }
✅ 已更新 project 参数: { id: 1, _id: 1, "serial-number-1773": 1, ... }
📋 构建的 project 参数: { id: 1, _id: 1, ... }
```

### 2. 查看网络请求

打开开发者工具 → Network 标签,查看查询请求:

```
Request URL:
http://localhost:3000/rest/core/t/投产通知单/d?query={...}

Request Payload:
{
  "skip": 0,
  "limit": 15,
  "project": {
    "id": 1,
    "_id": 1,
    "serial-number-1773": 1,
    ...
  },
  "filter": {...},
  "withCount": true
}
```

### 3. 检查返回数据

确保返回的数据包含所有需要的字段:

```typescript
const { items } = useModelList()

console.log('返回数据:', items[0])
// 应该包含:
// {
//   id: "...",
//   _id: "...",
//   "serial-number-1773": "...",
//   ...
// }
```

## 🔧 常见问题

### Q1: 为什么需要添加 id 和 _id 字段?

**A**:
- `id` 是记录的主键,用于更新、删除操作
- `_id` 是 MongoDB 的 ObjectId,某些操作需要用到
- 不包含这些字段会导致 CRUD 操作失败

### Q2: project 参数会影响性能吗?

**A**:
- ✅ 反而会**提升性能**
- 只查询需要的字段,减少数据传输量
- 后端只返回指定字段,降低查询开销

### Q3: 如何自定义需要返回的字段?

**A**:
```typescript
// 只返回部分字段
const project: Record<string, number> = {
  id: 1,
  'serial-number-1773': 1,
  'done': 1,
  // 其他字段不添加 = 不返回
}
```

### Q4: Schema 加载失败怎么办?

**A**:
```typescript
useEffect(() => {
  const loadSchema = async () => {
    try {
      const schemaData = await fetchSchema()
      setSchema(schemaData)
    } catch (error) {
      console.error('Schema 加载失败:', error)
      // 设置默认的 project 参数
      setOption({
        ...option,
        project: {
          id: 1,
          _id: 1,
        }
      })
    }
  }
  loadSchema()
}, [tableId])
```

## 📚 相关文件

### 修改的文件

1. **`src/services/production.service.ts`**
   - 改进 `buildProjectFromSchema` 函数
   - 添加系统字段 (id, _id)

2. **`src/pages/production/OrderListPageModel.tsx`**
   - 添加 `useModelState('option')`
   - 添加 useEffect 动态构建 project 参数
   - 在 Schema 加载后更新 option

### 相关文档

- [Model组件查询参数完整解决方案.md](./Model组件查询参数完整解决方案.md)
- [MODEL查询参数设置指南.md](./MODEL查询参数设置指南.md)

## 🚀 下一步

1. ✅ 测试生产订单页面,确认字段完整性
2. ✅ 检查其他使用 Model 组件的页面
3. ✅ 应用相同的修复到其他页面
4. ✅ 更新文档,说明 project 参数的重要性

---

**创建时间**: 2026-04-02
**状态**: ✅ 已修复
**版本**: v1.0
