# @airiot/client Model 模块迁移指南

## 概述

本指南帮助你将现有的 `useTableData` Hook 迁移到 @airiot/client 的 Model 模块。

## 优势对比

### 当前 useTableData
- ❌ 手动管理状态（useState）
- ❌ 手动处理分页、搜索、筛选
- ❌ 每个页面重复相同的逻辑
- ❌ 没有缓存机制
- ❌ 需要手动管理 loading 状态

### Model 模块
- ✅ 基于 Jotai 的自动状态管理
- ✅ 内置分页、排序、筛选
- ✅ 自动数据缓存和刷新
- ✅ 声明式配置，减少重复代码
- ✅ 统一的 loading 和错误处理

---

## 迁移步骤

### 步骤 1: 创建 Model 定义

在 `src/models/index.ts` 中定义你的数据模型：

```typescript
import { type ModelSchema } from '@airiot/client'

export const myTableModel: ModelSchema = {
  name: '表名',
  title: '表显示名',
  key: 'unique-model-key',  // 用于区分不同的 Model 实例
  permission: {
    view: true,
    add: true,
    edit: true,
    delete: true,
  },
  defaultValue: () => ({
    status: '待处理',
  }),
  initialValues: {
    option: { skip: 0, limit: 15 },
  },
  listFields: ['field1', 'field2', 'field3'],
  defaultOrder: { createdAt: 'DESC' },
  defaultPageSize: 15,
  properties: {
    field1: { type: 'string', title: '字段1' },
    field2: { type: 'number', title: '字段2' },
    field3: { type: 'string', title: '字段3' },
  },
}
```

### 步骤 2: 使用 Model Provider 包裹组件

```typescript
// 之前
function MyPage() {
  const { data, loading, reload } = useTableData('投产通知单')
  return <MyComponent data={data} loading={loading} reload={reload} />
}

// 之后
import { Model } from '@airiot/client'
import { productionOrderModel } from '@/models'

function MyPage() {
  return (
    <Model name="投产通知单" model={productionOrderModel} modelKey="production-orders">
      <MyComponent />
    </Model>
  )
}
```

### 步骤 3: 使用 Model Hooks

在组件内部使用 Model hooks：

```typescript
import {
  useModelList,        // 获取列表数据
  useModelPagination,  // 分页控制
  useModelGet,         // 获取单条记录
  useModelSave,        // 保存记录
  useModelDelete,      // 删除记录
} from '@airiot/client'

function MyComponent() {
  // 获取列表数据
  const { items, loading, fields } = useModelList()

  // 获取分页信息
  const { items: pageCount, activePage, changePage } = useModelPagination()

  // 保存操作
  const { saveItem } = useModelSave()

  // 删除操作
  const { deleteItem } = useModelDelete()

  return (
    <div>
      {loading ? <Spinner /> : (
        <>
          {items.map(item => (
            <div key={item.id}>{item.name}</div>
          ))}
          <Pagination
            total={pageCount}
            current={activePage}
            onChange={page => changePage(page)}
          />
        </>
      )}
    </div>
  )
}
```

---

## 功能对照表

| useTableData 功能 | Model Hooks 对应 | 说明 |
|------------------|-----------------|------|
| `data` | `useModelList().items` | 列表数据 |
| `loading` | `useModelList().loading` | 加载状态 |
| `pagination` | `useModelPagination()` | 分页信息 |
| `changePage` | `useModelPagination().changePage` | 切换页码 |
| `reload` | 自动刷新 | 数据自动同步 |
| `createRecord` | `useModelSave().saveItem` | 创建记录 |
| `updateRecord` | `useModelSave().saveItem` | 更新记录 |
| `deleteRecord` | `useModelDelete().deleteItem` | 删除记录 |
| `getRecord` | `useModelGet()` | 获取详情 |
| `searchText` | `useModelState('wheres')` | 搜索条件 |
| `filters` | `useModelState('wheres')` | 筛选条件 |

---

## 代码示例对比

### 场景 1: 列表页面

**之前 (useTableData)**:
```typescript
function OrderListPage() {
  const { data, loading, pagination, changePage } = useTableData('投产通知单')

  return (
    <div>
      {loading ? <Spinner /> : (
        data.map(order => <OrderCard key={order.id} data={order} />)
      )}
      <Pagination
        current={pagination.current}
        total={pagination.totalPages}
        onChange={changePage}
      />
    </div>
  )
}
```

**之后 (Model)**:
```typescript
function OrderListPage() {
  return (
    <Model name="投产通知单" model={productionOrderModel} modelKey="orders">
      <OrderListContent />
    </Model>
  )
}

function OrderListContent() {
  const { items, loading } = useModelList()
  const { activePage, pageCount, changePage } = useModelPagination()

  return (
    <div>
      {loading ? <Spinner /> : (
        items.map(order => <OrderCard key={order.id} data={order} />)
      )}
      <Pagination
        current={activePage}
        total={pageCount}
        onChange={changePage}
      />
    </div>
  )
}
```

### 场景 2: CRUD 操作

**之前 (useTableData)**:
```typescript
function OrderPage() {
  const { data, createRecord, updateRecord, deleteRecord } = useTableData('投产通知单')

  const handleCreate = async () => {
    await createRecord({ name: '新订单', status: '待投产' })
  }

  const handleUpdate = async (id: string) => {
    await updateRecord(id, { status: '生产中' })
  }

  const handleDelete = async (id: string) => {
    await deleteRecord(id)
  }

  return <div>...</div>
}
```

**之后 (Model)**:
```typescript
function OrderPage() {
  const { saveItem } = useModelSave()
  const { deleteItem } = useModelDelete()

  const handleCreate = async () => {
    await saveItem({ name: '新订单', status: '待投产' })
    // 自动刷新列表
  }

  const handleUpdate = async (id: string) => {
    await saveItem({ id, status: '生产中' })
    // 自动刷新列表
  }

  const handleDelete = async (id: string) => {
    await deleteItem(id)
    // 自动刷新列表
  }

  return <div>...</div>
}
```

---

## 高级用法

### 1. 自定义筛选条件

```typescript
import { useSetModelState } from '@airiot/client'

function FilterComponent() {
  const setWheres = useSetModelState('wheres')

  const applyFilter = (status: string) => {
    setWheres({ status: { $eq: status } })
  }

  return (
    <div>
      <Button onClick={() => applyFilter('待投产')}>待投产</Button>
      <Button onClick={() => applyFilter('生产中')}>生产中</Button>
    </div>
  )
}
```

### 2. 跨页面数据共享

```typescript
// 页面 A
<Model name="投产通知单" model={productionOrderModel} modelKey="shared-orders">
  <OrderList />
</Model>

// 页面 B - 使用相同的 modelKey，共享状态
<Model name="投产通知单" model={productionOrderModel} modelKey="shared-orders">
  <OrderDetail />
</Model>
```

### 3. 多 Model 组合

```typescript
function ComplexPage() {
  return (
    <>
      <Model name="投产通知单" model={productionOrderModel} modelKey="orders">
        <OrderList />
      </Model>

      <Model name="生产类型判定记录" model={determinationModel} modelKey="determinations">
        <DeterminationList />
      </Model>
    </>
  )
}
```

---

## 迁移检查清单

- [ ] 创建 Model 定义文件 (`src/models/index.ts`)
- [ ] 为每个表定义 ModelSchema
- [ ] 使用 Model Provider 包裹页面组件
- [ ] 替换 useTableData 为 Model Hooks
- [ ] 移除手动状态管理代码
- [ ] 测试 CRUD 操作
- [ ] 测试分页功能
- [ ] 测试筛选和搜索
- [ ] 验证错误处理

---

## 常见问题

### Q1: 如何处理复杂的表单验证？

A: 可以结合 SchemaForm 使用，或者在 saveItem 前进行验证：

```typescript
const { saveItem } = useModelSave()

const handleSubmit = async (data: any) => {
  // 自定义验证
  if (!data.name) {
    toastApi.error('请输入名称')
    return
  }

  try {
    await saveItem(data)
    toastApi.success('保存成功')
  } catch (error) {
    toastApi.error('保存失败')
  }
}
```

### Q2: 如何处理不同的 API 端点？

A: 在 Model 定义中配置 `resource`：

```typescript
const model: ModelSchema = {
  name: 'user',
  resource: 'core/user',  // 自定义 API 路径
  // ...
}
```

### Q3: 如何保持现有的弹窗逻辑？

A: 可以继续使用 useState 管理弹窗状态，Model 只负责数据管理：

```typescript
function MyPage() {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const { saveItem } = useModelSave()

  return (
    <Model name="table" model={model} modelKey="key">
      {/* 列表 */}
      <List />

      {/* 弹窗 */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <Form onSave={saveItem} />
      </Dialog>
    </Model>
  )
}
```

---

## 下一步

1. **试点迁移**: 选择一个简单的页面（如生产类型判定）先试点
2. **逐步推广**: 试点成功后，逐步迁移其他页面
3. **代码审查**: 迁移完成后，审查并清理旧的 useTableData 代码
4. **性能优化**: 利用 Model 的缓存机制优化性能

---

## 参考资料

- [@airiot/client 完整文档](../.claude/skills/airiot/SKILL.md)
- [Model 模块 API](../.claude/skills/airiot/SKILL.md#model-module)
- [示例代码](../src/pages/production/ProductionTypeDeterminationPageModel.tsx)
