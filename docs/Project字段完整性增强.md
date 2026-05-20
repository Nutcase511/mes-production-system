# Project 字段完整性增强

## 📋 问题描述

用户反馈：**"有些字段没有出现在接口参数里，导致没有查回内容里不全"**

## 🔍 问题分析

### 根本原因

之前的 `buildProjectFromSchema` 函数只提取了 `schema.properties` 中的字段，但可能遗漏了：

1. **系统元数据字段**：
   - `_createTime` - 创建时间
   - `_updateTime` - 更新时间
   - `_createUser` - 创建人
   - `_updateUser` - 更新人

2. **form 数组中的额外字段**：
   - 某些字段可能在 `form` 数组中引用，但没有在 `properties` 中定义
   - 这些字段也会被使用，但之前的逻辑没有包含它们

## ✅ 解决方案

### 1. 增强系统字段

**文件**: `src/pages/production/OrderListPageModel.tsx:129-154`

```typescript
useEffect(() => {
  if (schema && schema.schema) {
    const project: Record<string, number> = {}

    // ✅ 添加完整的系统字段
    project['id'] = 1
    project['_id'] = 1
    project['_createTime'] = 1    // 新增
    project['_updateTime'] = 1    // 新增
    project['_createUser'] = 1    // 新增
    project['_updateUser'] = 1    // 新增

    const schemaFields = schema.schema

    // 添加 Schema properties 中定义的所有字段
    if (schemaFields.properties) {
      Object.keys(schemaFields.properties).forEach(field => {
        project[field] = 1
      })
    }

    // ✅ 新增：检查 form 数组中的额外字段
    if (schemaFields.form && Array.isArray(schemaFields.form)) {
      schemaFields.form.forEach((field: string) => {
        if (!project[field]) {
          console.log('⚠️ 发现 form 中有但 properties 中没有的字段:', field)
          project[field] = 1
        }
      })
    }

    setOption({ ...option, project })
    console.log('✅ 已更新 project 参数:', project)
    console.log('📊 project 字段总数:', Object.keys(project).length)
  }
}, [schema, setOption])
```

### 2. 同步更新 buildProjectFromSchema 函数

**文件**: `src/services/production.service.ts:465-517`

```typescript
export function buildProjectFromSchema(schema: TableSchema): Record<string, number> {
  const project: Record<string, number> = {}

  if (!schema) return project

  // ✅ 添加完整的系统字段
  project['id'] = 1
  project['_id'] = 1
  project['_createTime'] = 1
  project['_updateTime'] = 1
  project['_createUser'] = 1
  project['_updateUser'] = 1

  const schemaFields = schema.schema || schema

  console.log('📋 Schema 结构:', {
    hasProperties: !!schemaFields.properties,
    hasForm: !!schemaFields.form,
    propertiesKeys: schemaFields.properties ? Object.keys(schemaFields.properties) : [],
    formFields: schemaFields.form || []
  })

  // 添加 properties 中的字段
  if (schemaFields.properties) {
    Object.keys(schemaFields.properties).forEach(field => {
      project[field] = 1
    })
  }

  // ✅ 新增：检查 form 数组中的额外字段
  if (schemaFields.form && Array.isArray(schemaFields.form)) {
    schemaFields.form.forEach((field: string) => {
      if (!project[field]) {
        console.log('⚠️ 发现 form 中有但 properties 中没有的字段:', field)
        project[field] = 1
      }
    })
  }

  console.log('📋 构建的 project 参数:', project)
  console.log('📊 project 字段总数:', Object.keys(project).length)
  return project
}
```

## 📊 改进效果

### 修复前

```json
{
  "project": {
    "id": 1,
    "_id": 1,
    "serial-number-1773": 1,
    "text-B2EF": 1,
    ...
  }
}
```

**问题**：
- ❌ 缺少系统元数据字段
- ❌ 可能遗漏 form 数组中的额外字段

### 修复后

```json
{
  "project": {
    "id": 1,
    "_id": 1,
    "_createTime": 1,
    "_updateTime": 1,
    "_createUser": 1,
    "_updateUser": 1,
    "serial-number-1773": 1,
    "text-B2EF": 1,
    "done": 1,
    ...
  }
}
```

**改进**：
- ✅ 包含所有系统元数据字段
- ✅ 包含 properties 中的所有字段
- ✅ 包含 form 数组中的额外字段
- ✅ 添加详细的调试日志

## 🔍 调试方法

### 1. 查看控制台日志

打开浏览器控制台，应该能看到：

```
📋 Schema 结构: {
  hasProperties: true,
  hasForm: true,
  propertiesKeys: ["serial-number-1773", "text-B2EF", ...],
  formFields: ["text-B2EF", "done", ...]
}

⚠️ 发现 form 中有但 properties 中没有的字段: someField

✅ 已更新 project 参数: { id: 1, _id: 1, ... }

📊 project 字段总数: 15
```

### 2. 对比 Schema 和 project

在控制台中执行：

```javascript
// 查看完整的 schema
console.log('Schema:', schema)

// 查看 project 参数
console.log('Project:', option.project)

// 对比字段数量
console.log('Properties 字段数:', Object.keys(schema.schema.properties).length)
console.log('Form 字段数:', schema.schema.form.length)
console.log('Project 字段数:', Object.keys(option.project).length)
```

### 3. 检查网络请求

打开开发者工具 → Network 标签，查看查询请求：

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
    "_createTime": 1,
    "_updateTime": 1,
    "_createUser": 1,
    "_updateUser": 1,
    ...
  }
}
```

### 4. 验证返回数据

检查返回的数据是否包含所有需要的字段：

```javascript
const { items } = useModelList()

// 查看第一条记录的完整字段
console.log('第一条记录:', items[0])
console.log('记录字段:', Object.keys(items[0]))

// 检查是否有 undefined 的字段
Object.keys(option.project).forEach(field => {
  if (items[0][field] === undefined) {
    console.warn('⚠️ 字段缺失:', field)
  }
})
```

## 🎯 常见问题

### Q1: 为什么需要添加 _createTime 等字段?

**A**: 这些是 AIRIOT MES 的系统字段，用于：
- `_createTime` - 记录创建时间，用于审计和排序
- `_updateTime` - 记录最后更新时间，用于增量同步
- `_createUser` - 创建人信息，用于权限控制
- `_updateUser` - 最后更新人信息，用于审计

### Q2: form 和 properties 的区别是什么?

**A**:
- **properties**: 定义字段的数据类型、验证规则等元信息
- **form**: 定义表单中字段的显示顺序和可编辑性

某些情况下，form 可能引用了 properties 中没有定义的字段（如计算字段、虚拟字段等），这些字段也需要在 project 中指定。

### Q3: 如何确认所有字段都被包含?

**A**:
1. 查看控制台的 `📊 project 字段总数` 日志
2. 对比 Schema 中定义的字段数量
3. 检查是否有 `⚠️ 发现 form 中有但 properties 中没有的字段` 警告
4. 验证返回的数据包含所有需要的字段

### Q4: 如果仍然缺少字段怎么办?

**A**:
1. 在控制台查看完整的 Schema 结构
2. 手动添加缺失的字段：

```typescript
// 在 useEffect 中添加
project['yourMissingField'] = 1
```

3. 或者检查 Schema 是否有其他嵌套结构：

```typescript
// 检查其他可能的位置
if (schema.schema.otherFields) {
  Object.keys(schema.schema.otherFields).forEach(field => {
    project[field] = 1
  })
}
```

## 📚 相关文件

### 修改的文件

1. **`src/pages/production/OrderListPageModel.tsx`**
   - 增强系统字段（添加 _createTime 等）
   - 检查 form 数组中的额外字段
   - 添加详细日志

2. **`src/services/production.service.ts`**
   - 同步更新 buildProjectFromSchema 函数
   - 添加 form 数组字段检查
   - 添加详细日志

### 相关文档

- [Project字段完整性修复指南.md](./Project字段完整性修复指南.md)
- [Project字段修复总结.md](./Project字段修复总结.md)

## 🚀 下一步

1. ✅ 刷新页面，查看控制台日志
2. ✅ 确认 project 字段总数是否增加
3. ✅ 检查网络请求中的 project 参数
4. ✅ 验证返回数据是否包含所有字段
5. ✅ 如果仍有字段缺失，查看 Schema 结构并手动添加

---

**创建时间**: 2026-04-02
**状态**: ✅ 已增强
**版本**: v2.0 - 包含系统字段和 form 数组检查
