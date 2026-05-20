# AIRIOT 数据表创建清单

本文档列出了新功能页面需要在 AIRIOT 后台创建的所有数据表及其 Schema。

---

## 📋 表清单（共9张新表）

### P0 优先级（核心流程）
1. ✅ **生产类型判定记录** - ProductionTypeDetermination
2. ✅ **生产准备检查记录** - PreparationChecklist
3. ✅ **试生产控制记录** - TrialProductionControl

### P1 优先级（重要功能）
4. ✅ **批次关联** - BatchRelation
5. ✅ **物料追溯记录** - MaterialTrace
6. ✅ **库存预警** - InventoryAlert
7. ✅ **库存预警规则** - InventoryAlertRule

### P2 优先级（体验优化）
8. ✅ **过程监控规则** - MonitoringRule
9. ✅ **规则执行历史** - RuleExecutionHistory

---

## 📊 详细 Schema

### 1. 生产类型判定记录

**表名（AIRIOT中）**：`生产类型判定记录`（注意：不带"表"字）
**用途**：记录订单生产类型的自动判定和人工修正结果

| 字段名 | 字段标签 | 字段类型 | 必填 | 说明 |
|--------|---------|---------|------|------|
| id | 记录ID | 序列号 | 是 | 主键 |
| orderId | 订单ID | 文本 | 是 | 关联订单ID |
| orderNo | 订单编号 | 文本 | 是 | 订单编号 |
| originalType | 系统判定类型 | 下拉选择 | 是 | 研制生产/外协生产/常规生产 |
| finalType | 最终确认类型 | 下拉选择 | 是 | 研制生产/外协生产/常规生产 |
| determinationBasis | 判定依据 | 长文本 | 是 | JSON格式存储判定因素 |
| confidence | 置信度 | 数字 | 是 | 0-1之间的小数 |
| reasons | 判定原因 | 长文本 | 是 | 判定原因列表（JSON数组） |
| determiner | 判定人 | 文本 | 否 | 科管部人员 |
| determinationTime | 判定时间 | 日期时间 | 否 | 判定完成时间 |
| remark | 备注 | 长文本 | 否 | 人工修正说明 |
| status | 状态 | 下拉选择 | 是 | 待确认/已确认/已修正 |
| _createTime | 创建时间 | 日期时间 | 是 | 自动生成 |
| _updateTime | 更新时间 | 日期时间 | 是 | 自动更新 |

**下拉选择选项**：
- `originalType` / `finalType`: 研制生产, 外协生产, 常规生产
- `status`: 待确认, 已确认, 已修正

---

### 2. 生产准备检查记录

**表名（AIRIOT中）**：`生产准备检查记录`
**表名（英文）**：`preparation_checklist`
**用途**：记录生产前的5大类19项准备检查结果

| 字段名 | 字段标签 | 字段类型 | 必填 | 说明 |
|--------|---------|---------|------|------|
| id | 记录ID | 序列号 | 是 | 主键 |
| workOrderId | 工单ID | 文本 | 是 | 关联工单ID |
| workOrderNo | 工单编号 | 文本 | 是 | 工单编号 |
| orderId | 订单ID | 文本 | 是 | 关联订单ID |
| orderNo | 订单编号 | 文本 | 是 | 订单编号 |
| checkItems | 检查项记录 | 长文本 | 是 | JSON数组，存储19项检查结果 |
| overallStatus | 整体状态 | 下拉选择 | 是 | 待检查/已通过/预警/未通过 |
| checker | 总检查人 | 文本 | 否 | 检查执行人 |
| checkTime | 检查时间 | 日期时间 | 否 | 检查完成时间 |
| approver | 审批人 | 文本 | 否 | 审批人员 |
| approvalTime | 审批时间 | 日期时间 | 否 | 审批完成时间 |
| remark | 备注 | 长文本 | 否 | 检查说明 |
| status | 流程状态 | 下拉选择 | 是 | 草稿/已提交/已批准/已驳回 |
| _createTime | 创建时间 | 日期时间 | 是 | 自动生成 |
| _updateTime | 更新时间 | 日期时间 | 是 | 自动更新 |

**checkItems JSON 结构示例**：
```json
[
  {
    "checkItemId": "T001",
    "category": "刀具",
    "itemName": "刀具规格确认",
    "status": "ok",
    "checker": "张三",
    "checkTime": "2024-03-01T10:30:00",
    "remark": ""
  },
  {
    "checkItemId": "T002",
    "category": "刀具",
    "itemName": "刀具寿命检查",
    "status": "ok",
    "checker": "李四",
    "checkTime": "2024-03-01T10:35:00",
    "remark": ""
  }
]
```

**下拉选择选项**：
- `overallStatus`: 待检查, 已通过, 预警, 未通过
- `status`: 草稿, 已提交, 已批准, 已驳回

---

### 3. 试生产控制记录

**表名（AIRIOT中）**：`试生产控制记录`
**表名（英文）**：`trial_production_control`
**用途**：记录工序试生产的四重验证结果

| 字段名 | 字段标签 | 字段类型 | 必填 | 说明 |
|--------|---------|---------|------|------|
| id | 记录ID | 序列号 | 是 | 主键 |
| workOrderId | 工单ID | 文本 | 是 | 关联工单ID |
| workOrderNo | 工单编号 | 文本 | 是 | 工单编号 |
| equipmentCheck | 设备点检结果 | 长文本 | 是 | JSON对象，存储设备点检信息 |
| toolVerification | 刀具验证结果 | 长文本 | 是 | JSON数组，存储刀具验证信息 |
| materialVerification | 材料验证结果 | 长文本 | 是 | JSON数组，存储材料验证信息 |
| programVerification | 程序校验结果 | 长文本 | 是 | JSON对象，存储程序校验信息 |
| overallStatus | 整体状态 | 下拉选择 | 是 | 待验证/已通过/未通过 |
| approvedBy | 审批人 | 文本 | 否 | 审批人员 |
| approvalTime | 审批时间 | 日期时间 | 否 | 审批完成时间 |
| _createTime | 创建时间 | 日期时间 | 是 | 自动生成 |
| _updateTime | 更新时间 | 日期时间 | 是 | 自动更新 |

**equipmentCheck JSON 结构示例**：
```json
{
  "status": "ok",
  "checker": "张三",
  "checkTime": "2024-03-01T10:30:00",
  "remark": "设备状态良好"
}
```

**toolVerification JSON 结构示例**：
```json
[
  {
    "toolCode": "T001",
    "toolName": "外圆刀",
    "batchNo": "B20240301",
    "verified": true,
    "verifier": "李四",
    "verifyTime": "2024-03-01T10:35:00"
  }
]
```

**materialVerification JSON 结构示例**：
```json
[
  {
    "materialCode": "M001",
    "materialName": "铝棒",
    "batchNo": "B20240301",
    "supplier": "XX材料厂",
    "verified": true,
    "verifier": "王五",
    "verifyTime": "2024-03-01T10:40:00"
  }
]
```

**programVerification JSON 结构示例**：
```json
{
  "status": "matched",
  "programVersion": "V2.3",
  "cappVersion": "V2.3",
  "verifier": "赵六",
  "verifyTime": "2024-03-01T10:45:00"
}
```

**下拉选择选项**：
- `overallStatus`: 待验证, 已通过, 未通过

---

### 4. 批次关联

**表名（AIRIOT中）**：`批次关联`
**表名（英文）**：`batch_relation`
**用途**：建立批次号与订单、工单的关联关系，支持质量追溯

| 字段名 | 字段标签 | 字段类型 | 必填 | 说明 |
|--------|---------|---------|------|------|
| id | 记录ID | 序列号 | 是 | 主键 |
| batchNo | 批次号 | 文本 | 是 | 唯一标识，格式：B+年月日+订单后4位+流水号 |
| orderId | 订单ID | 文本 | 是 | 关联订单ID |
| orderNo | 订单编号 | 文本 | 是 | 订单编号 |
| workOrderId | 工单ID | 文本 | 是 | 关联工单ID |
| workOrderNo | 工单编号 | 文本 | 是 | 工单编号 |
| inboundId | 入库单ID | 文本 | 是 | 关联入库单ID |
| inboundTime | 入库时间 | 日期时间 | 是 | 入库完成时间 |
| quantity | 入库数量 | 数字 | 是 | 该批次的产品数量 |
| traceChain | 追溯链 | 长文本 | 否 | JSON数组，存储完整追溯信息 |
| _createTime | 创建时间 | 日期时间 | 是 | 批次创建时间 |
| _updateTime | 更新时间 | 日期时间 | 是 | 自动更新 |

**批次号格式**：`B20240301001A001`
- `B` - 固定前缀
- `20240301` - 年月日（8位）
- `0001` - 订单号后4位
- `A001` - 流水号（4位）

**traceChain JSON 结构**：参见 src/services/trace.service.ts 中的 TraceChainItem 接口

---

### 5. 物料追溯记录

**表名（AIRIOT中）**：`物料追溯记录`
**表名（英文）**：`material_trace`
**用途**：记录物料在生产过程中的使用情况，支持物料追溯

| 字段名 | 字段标签 | 字段类型 | 必填 | 说明 |
|--------|---------|---------|------|------|
| id | 记录ID | 序列号 | 是 | 主键 |
| workOrderId | 工单ID | 文本 | 是 | 关联工单ID |
| workOrderNo | 工单编号 | 文本 | 是 | 工单编号 |
| materialCode | 物料编码 | 文本 | 是 | 物料主数据编码 |
| materialName | 物料名称 | 文本 | 是 | 物料名称 |
| batchNo | 物料批次号 | 文本 | 是 | 物料批次号 |
| supplier | 供应商 | 文本 | 是 | 物料供应商 |
| quantity | 使用数量 | 数字 | 是 | 该工单使用的数量 |
| unit | 单位 | 文本 | 是 | 计量单位 |
| useTime | 使用时间 | 日期时间 | 是 | 物料投入生产时间 |
| operator | 操作人 | 文本 | 是 | 领料人 |
| processId | 工序ID | 文本 | 是 | 使用该物料的工序ID |
| processName | 工序名称 | 文本 | 是 | 工序名称 |
| remark | 备注 | 长文本 | 否 | 备注 |
| _createTime | 创建时间 | 日期时间 | 是 | 记录创建时间 |

---

### 6. 库存预警

**表名（中文）**：`库存预警`
**表名（英文）**：`inventory_alert`
**用途**：记录当前触发的库存预警信息

| 字段名 | 字段标签 | 字段类型 | 必填 | 说明 |
|--------|---------|---------|------|------|
| id | 预警ID | 序列号 | 是 | 主键 |
| materialCode | 物料编码 | 文本 | 是 | 物料主数据编码 |
| materialName | 物料名称 | 文本 | 是 | 物料名称 |
| currentStock | 当前库存 | 数字 | 是 | 当前库存数量 |
| minStock | 最低库存 | 数字 | 是 | 库存下限 |
| maxStock | 最高库存 | 数字 | 否 | 库存上限 |
| shortage | 缺口数量 | 数字 | 是 | minStock - currentStock |
| level | 预警级别 | 下拉选择 | 是 | 严重/一般/提示 |
| status | 处理状态 | 下拉选择 | 是 | 待处理/处理中/已解决/已忽略 |
| alertTime | 预警时间 | 日期时间 | 是 | 预警触发时间 |
| handler | 处理人 | 文本 | 否 | 负责处理的人员 |
| handleTime | 处理时间 | 日期时间 | 否 | 实际处理时间 |
| handleRemark | 处理说明 | 长文本 | 否 | 处理说明 |
| _createTime | 创建时间 | 日期时间 | 是 | 自动生成 |
| _updateTime | 更新时间 | 日期时间 | 是 | 自动更新 |

**下拉选择选项**：
- `level`: 严重, 一般, 提示
- `status`: 待处理, 处理中, 已解决, 已忽略

---

### 7. 库存预警规则

**表名（中文）**：`库存预警规则`
**表名（英文）**：`inventory_alert_rule`
**用途**：配置库存预警的触发规则

| 字段名 | 字段标签 | 字段类型 | 必填 | 说明 |
|--------|---------|---------|------|------|
| id | 规则ID | 序列号 | 是 | 主键 |
| ruleName | 规则名称 | 文本 | 是 | 规则名称 |
| materialCode | 物料编码 | 文本 | 是 | 应用规则的物料编码 |
| materialName | 物料名称 | 文本 | 是 | 物料名称（冗余） |
| minStock | 最低库存阈值 | 数字 | 是 | 触发预警的下限 |
| maxStock | 最高库存阈值 | 数字 | 否 | 触发预警的上限 |
| alertLevel | 预警级别 | 下拉选择 | 是 | 规则对应的预警级别 |
| autoCreatePurchase | 自动创建采购单 | 布尔 | 是 | 是否自动创建采购申请 |
| enabled | 是否启用 | 布尔 | 是 | 规则是否启用 |
| remark | 备注 | 长文本 | 否 | 规则说明 |
| _createTime | 创建时间 | 日期时间 | 是 | 自动生成 |
| _updateTime | 更新时间 | 日期时间 | 是 | 自动更新 |

**下拉选择选项**：
- `alertLevel`: 严重, 一般, 提示

---

### 8. 过程监控规则

**表名（中文）**：`过程监控规则`
**表名（英文）**：`monitoring_rule`
**用途**：配置生产过程中的监控规则（抽检、尺寸、刀具、参数）

| 字段名 | 字段标签 | 字段类型 | 必填 | 说明 |
|--------|---------|---------|------|------|
| id | 规则ID | 序列号 | 是 | 主键 |
| ruleName | 规则名称 | 文本 | 是 | 规则名称 |
| ruleType | 规则类型 | 下拉选择 | 是 | 抽检规则/关键尺寸监控/刀具寿命监控/工艺参数监控 |
| processId | 适用工序ID | 文本 | 是 | 工序ID |
| processName | 适用工序名称 | 文本 | 是 | 工序名称（冗余） |
| parameters | 监控参数 | 长文本 | 否 | JSON对象，存储具体参数配置 |
| thresholdMin | 阈值下限 | 数字 | 否 | 数值类监控的下限 |
| thresholdMax | 阈值上限 | 数字 | 否 | 数值类监控的上限 |
| samplingRate | 抽检频率 | 数字 | 否 | 每N件抽检1件（仅抽检规则） |
| actions | 触发动作 | 长文本 | 是 | JSON数组，存储触发后的动作列表 |
| enabled | 是否启用 | 布尔 | 是 | 规则是否启用 |
| remark | 备注 | 长文本 | 否 | 规则说明 |
| _createTime | 创建时间 | 日期时间 | 是 | 自动生成 |
| _updateTime | 更新时间 | 日期时间 | 是 | 自动更新 |

**下拉选择选项**：
- `ruleType`: 抽检规则, 关键尺寸监控, 刀具寿命监控, 工艺参数监控

**actions JSON 结构示例**：
```json
["alert", "pause", "inspect", "scrap"]
```
- `alert`: 弹出预警提示
- `pause`: 自动暂停生产
- `inspect`: 触发质检流程
- `scrap`: 报废处理

**parameters JSON 结构示例**：
```json
{
  "dimensionName": "外径",
  "toolCode": "T001",
  "parameterCode": "SPINDLE_SPEED"
}
```

---

### 9. 规则执行历史

**表名（中文）**：`规则执行历史`
**表名（英文）**：`rule_execution_history`
**用途**：记录过程监控规则的执行历史

| 字段名 | 字段标签 | 字段类型 | 必填 | 说明 |
|--------|---------|---------|------|------|
| id | 记录ID | 序列号 | 是 | 主键 |
| ruleId | 规则ID | 文本 | 是 | 关联的监控规则ID |
| ruleName | 规则名称 | 文本 | 是 | 规则名称（冗余） |
| workOrderId | 工单ID | 文本 | 是 | 关联工单ID |
| workOrderNo | 工单编号 | 文本 | 是 | 工单编号 |
| reportId | 报工单ID | 文本 | 是 | 触发该规则的报工单ID |
| triggered | 是否触发 | 布尔 | 是 | 规则是否被触发 |
| triggerReason | 触发原因 | 长文本 | 否 | 触发原因说明 |
| actions | 执行动作 | 长文本 | 是 | JSON数组，存储执行的动作列表 |
| executionResult | 执行结果 | 长文本 | 否 | JSON对象，存储执行结果详情 |
| executionTime | 执行时间 | 日期时间 | 是 | 规则执行时间 |
| _createTime | 创建时间 | 日期时间 | 是 | 自动生成 |

**actions JSON 结构示例**：
```json
[
  {
    "action": "alert",
    "executed": true,
    "result": "已弹出预警"
  },
  {
    "action": "pause",
    "executed": true,
    "result": "已暂停生产"
  }
]
```

---

## 🔧 表创建注意事项

### 1. JSON 字段处理

AIRIOT 对 JSON 字段的处理：
- **长文本类型**：在 AIRIOT 中选择"长文本"或"多行文本"类型
- **存储格式**：JSON 字符串格式
- **读取时**：前端需要 `JSON.parse()` 解析
- **写入时**：前端需要 `JSON.stringify()` 序列化

### 2. 日期时间字段

- 使用 AIRIOT 的"日期时间"类型
- 自动生成字段（如 `_createTime`）设置为自动填充
- 自动更新字段（如 `_updateTime`）设置为自动更新

### 3. 下拉选择字段

- 在 AIRIOT 中配置选项列表
- 确保选项值与代码中的枚举值完全一致
- 区分大小写

### 4. 关联字段

- 订单ID、工单ID等关联字段使用"文本"类型
- 不使用外键约束，通过应用层维护关联关系
- 建议在字段描述中注明关联的表

### 5. 索引建议

为提高查询性能，建议对以下字段创建索引：
- `batchNo`（批次关联表）
- `orderId`, `orderNo`（所有表）
- `workOrderId`, `workOrderNo`（所有表）
- `materialCode`, `materialName`（库存相关表）
- `_createTime`（所有表，用于时间范围查询）

---

## 📝 表创建顺序

建议按以下顺序创建表：

1. **生产类型判定记录表** - PT-01 功能
2. **生产准备检查记录表** - PRE-01 功能
3. **试生产控制记录表** - OP-01 功能
4. **批次关联表** - 业务闭环
5. **物料追溯记录表** - MAT-01 功能
6. **库存预警规则表** - 先创建规则表
7. **库存预警表** - 依赖规则表
8. **过程监控规则表** - OP-02 功能
9. **规则执行历史表** - 依赖规则表

---

## ✅ 验证检查

创建表后，请验证以下内容：

- [ ] 所有字段类型正确
- [ ] 下拉选择选项配置完整
- [ ] 必填字段设置正确
- [ ] JSON 字段使用长文本类型
- [ ] 日期时间字段配置正确
- [ ] 表名与代码中的 `tableId` 一致
- [ ] 在 AIRIOT 后台能看到新建的表
- [ ] 能够通过前端代码访问表数据

---

## 📞 相关文件

- 前端配置：`src/config/tables.config.ts`
- 类型定义：各个 `src/services/*.service.ts` 文件
- 页面代码：`src/pages/*/` 目录下的页面文件

创建完成后，请在 `src/config/tables.config.ts` 中确认表配置已添加。
