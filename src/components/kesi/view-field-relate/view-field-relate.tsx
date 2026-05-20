import React from 'react'
import isArray from 'lodash/isArray'
import isString from 'lodash/isString'
import isObject from 'lodash/isObject'
import isNil from 'lodash/isNil'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDown, ChevronUp, Table as TableIcon, ExternalLink } from 'lucide-react'
import { tableConverter } from '@/lib/view-table-converter'
import { createAPI } from '@airiot/client'

// ============================================
// 工具函数
// ============================================

// 递归解析 JSON 字符串
function parseJsonStrings(data: any): any {
  if (!data) return data

  const clonedData: any = JSON.parse(JSON.stringify(data))

  const processValue = (value: any): any => {
    if (isString(value)) {
      try {
        const parsed = JSON.parse(value)
        if (isObject(parsed) && parsed !== null) {
          return processValue(parsed)
        }
        return value
      } catch (e) {
        return value
      }
    }

    if (isArray(value)) {
      return value.map(item => processValue(item))
    }

    if (isObject(value) && value !== null) {
      Object.keys(value).forEach(key => {
        ; (value as any)[key] = processValue((value as any)[key])
      })
      return value
    }

    return value
  }

  return processValue(clonedData)
}

// 解析 value（可能是 JSON 字符串）
function parseValue(value: any): any {
  let v = value
  if (isString(value)) {
    try {
      v = JSON.parse(value)
    } catch (e) {
      // 解析失败，返回原值
    }
  }
  return v
}

// ============================================
// DetailShow 组件 - 点击查看关联数据详情
// ============================================

const ViewFieldRender = ({ value, schema }: { value: any, schema: any }) => {
  const FieldComponent = tableConverter(schema, {})
  return <FieldComponent value={value} schema={schema} />
}
interface DetailShowProps {
  children: React.ReactNode
  schema: any
  value: any
  inList?: boolean
}

const DetailShow: React.FC<DetailShowProps> = ({ children, schema, value }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const [detailData, setDetailData] = React.useState<Array<{ title: string; value: any }>>([])
  const [loading, setLoading] = React.useState(false)

  const FieldComponent = tableConverter(schema, {})

  const getDetailData = async () => {
    if (!value?.id || !schema?.relate?.id) {
      return
    }

    setLoading(true)
    try {
      // 先获取表结构
      const api = createAPI({ resource: 'core/t/schema' })
      const relateTable = await api.get(schema.relate.id)

      if (!relateTable?.schema) {
        setLoading(false)
        return
      }

      // 再获取数据详情
      const dataApi = createAPI({ resource: `core/t/${schema.relate.id}/d/` })
      const data = await dataApi.get(value.id)

      setLoading(false)
      if (!data || Object.keys(data).length === 0) {
        return
      }

      // 根据 recordDetail.showField 构建详情数据
      const result: Array<{ title: string; value: any }> = []
      const showFields = schema.recordDetail?.showField || Object.keys(relateTable.schema.properties || {}).slice(0, 10)

      showFields.forEach((key: string) => {
        const s = relateTable.schema.properties?.[key]
        if (!s) return

        let fieldValue: any
        if (s.fieldType === 'attachment' || s.fieldType === 'attachments') {
          fieldValue = <FieldComponent value={data?.[key]} schema={s} inList={false} />
        } else {
          fieldValue = <FieldComponent value={data?.[key]} schema={s} inList={false} />
        }

        result.push({
          title: s?.title || key,
          value: fieldValue
        })
      })

      setDetailData(result)
    } catch (e) {
      setLoading(false)
    }
  }

  const handleClick = () => {
    if (!value?.id) return

    const showType = schema.recordDetail?.showType

    if (showType === 'page') {
      // 跳转页面
      const url = `/table/${schema?.relate?.id}/${value.id}/detail`
      window.open(url, '_blank')
    } else if (showType === 'popover') {
      // 先获取数据，然后显示 popover
      if (detailData.length === 0) {
        getDetailData()
      }
      setPopoverOpen(!popoverOpen)
    } else if (showType === 'modal') {
      // 先获取数据，然后显示 dialog
      if (detailData.length === 0) {
        getDetailData()
      }
      setDialogOpen(!dialogOpen)
    } else {
      // 默认不处理
    }
  }

  // 如果没有配置 recordDetail，直接显示子元素
  if (!schema?.recordDetail?.showType) {
    return <>{children}</>
  }

  const showType = schema.recordDetail?.showType

  // Popover 模式
  if (showType === 'popover') {
    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <span className="cursor-pointer hover:text-blue-600" onClick={handleClick}>
            {children}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-125 max-h-100 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-4">加载中...</div>
          ) : (
            <div className="space-y-2">
              {detailData.map((item, index) => (
                <div key={index} className="flex">
                  <span className="w-24 text-slate-600 shrink-0">{item.title}：</span>
                  <span className="flex-1">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    )
  }

  // Modal 模式
  if (showType === 'modal') {
    return (
      <>
        <span className="cursor-pointer hover:text-blue-600" onClick={handleClick}>
          {children}
        </span>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>记录详情</DialogTitle>
            </DialogHeader>
            {loading ? (
              <div className="flex justify-center py-8">加载中...</div>
            ) : (
              <div className="space-y-3">
                {detailData.map((item, index) => (
                  <div key={index} className="flex">
                    <span className="w-32 text-slate-600 shrink-0">{item.title}：</span>
                    <span className="flex-1">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Page 模式 - 跳转链接
  if (showType === 'page') {
    return (
      <span className="cursor-pointer hover:text-blue-600 inline-flex items-center gap-1" onClick={handleClick}>
        {children}
        <ExternalLink className="h-3 w-3" />
      </span>
    )
  }

  // 默认显示子元素
  return <>{children}</>
}

// ============================================
// 单条记录展示
// ============================================

const ItemShow: React.FC<{
  relateSchema: any
  val: any
  field?: any
  detailPage?: boolean
}> = ({ relateSchema, val, field, detailPage }) => {
  // 获取显示字段配置（从 schema.relate.fields[0]）
  const displayFieldConfig = relateSchema?.relate?.fields?.[0]
  const displayFieldKey = displayFieldConfig?.key
  const fieldSchema = displayFieldConfig?.fieldSchema

  const FieldComponent = tableConverter(relateSchema, {})

  // 详情页模式 - 完整展示所有字段
  if (detailPage) {
    return (
      <div className="inline-block bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-3 mr-2 mt-2 align-top" style={{ width: 500 }}>
        <div className="flex mb-2">
          <span className="w-24 text-slate-600 dark:text-slate-400">记录编号：</span>
          <span className="flex-1">{val.id}</span>
        </div>
        {relateSchema.relateShowFields?.map((f: any, index: number) => (
          <div key={index} className="flex">
            <span className="w-24 text-slate-600 dark:text-slate-400">{f.title}：</span>
            <span className="flex-1">
              <FieldComponent
                value={val[f.key]}
                schema={f.fieldSchema}
              />
            </span>
          </div>
        ))}
      </div>
    )
  }

  // 多字段展示模式 - 卡片式展示
  if (relateSchema.relateShowFields?.length > 0) {
    return (
      <div className="inline-block bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-2 mr-2 mt-2 align-top" style={{ width: 'calc(50% - 10px)' }}>
        <div className="font-medium text-sm mb-1">
          {val[displayFieldKey || field?.displayField || 'name']}
        </div>
        {relateSchema.relateShowFields.map((f: any, index: number) => (
          <div key={index} className="text-xs text-slate-600 dark:text-slate-400 flex">
            <span className="w-20 shrink-0">{f.title}：</span>
            <span className="flex-1 truncate">
              <FieldComponent
                value={val[f.key]}
                schema={f.fieldSchema}
              />
            </span>
          </div>
        ))}
      </div>
    )
  }

  // 默认标签模式 - 使用 fieldRender 渲染或直接显示
  const getDisplayValue = () => {
    // 从 val[field.key] 获取实际值
    let fieldValue = val?.[displayFieldKey]

    // 尝试解析 JSON 字符串
    if (isString(fieldValue)) {
      try {
        const parsed = JSON.parse(fieldValue)
        if (isObject(parsed) || isArray(parsed)) {
          fieldValue = parsed
        }
      } catch (e) {
        // 保持原值
      }
    }

    // 对于特定类型，直接显示原始值
    const directDisplayTypes = ['input', 'serialNumber', 'timePicker', 'dateRange', 'date-range']
    if (directDisplayTypes.includes(fieldSchema?.fieldType) || directDisplayTypes.includes(fieldSchema?.type)) {
      return val?.[displayFieldKey]
    }

    // 使用 ViewFieldRender 渲染字段值
    return (
      <FieldComponent
        value={fieldValue}
        schema={fieldSchema}
      />
    )
  }

  return (
    <DetailShow schema={relateSchema} value={val}>
      <span className="inline-block border rounded px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800">
        {getDisplayValue()}
      </span>
    </DetailShow>
  )
}

// ============================================
// 表格展示模式
// ============================================

const TableShow: React.FC<{
  relateSchema: any
  val: any[]
  field?: any
}> = ({ relateSchema, val, field }) => {
  const [open, setOpen] = React.useState(false)

  if (!isArray(val) || val.length === 0) {
    return <span className="text-muted-foreground">空</span>
  }

  // 获取显示字段
  const getDisplayFields = () => {
    const fields: any[] = []
    if (field?.displayField) {
      fields.push({ key: field.displayField, title: '名称' })
    }
    if (relateSchema?.showField) {
      fields.push({ key: relateSchema.showField, title: relateSchema.showField })
    }
    if (field?.relateShowFields?.length > 0) {
      fields.push(...field.relateShowFields)
    }
    return fields.filter(f => f.key)
  }

  const displayFields = getDisplayFields()

  if (displayFields.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{val.length} 条数据</span>
      </div>
    )
  }

  return (
    <>
      <div
        className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
        onClick={() => setOpen(true)}
      >
        <TableIcon className="h-4 w-4" />
        <span>{val.length} 条数据</span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>关联数据</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-200 dark:border-slate-700">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800">
                  {displayFields.map((field) => (
                    <th
                      key={field.key}
                      className="border border-slate-200 dark:border-slate-700 px-4 py-2 text-left text-sm font-medium"
                    >
                      {field.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {val.map((row: any, index: number) => (
                  <tr key={index}>
                    {displayFields.map((field) => {
                      const FieldComponent = tableConverter(relateSchema, {})
                      return (
                        <td
                          key={field.key}
                          className="border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm"
                        >
                          <FieldComponent
                            value={row[field.key]}
                            schema={{ title: field.title }}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ============================================
// 关联字段 Plus 主组件
// ============================================

export interface RelatePlusShowProps {
  value: any
  schema?: any
  inList?: boolean
}

export const Relate: React.FC<RelatePlusShowProps> = ({ value, schema, inList }) => {
  const [expand, setExpand] = React.useState(false)

  if (isNil(value)) {
    return <span className="text-muted-foreground">空</span>
  }

  // 解析 value（可能是 JSON 字符串）
  const parsedValue = parseValue(value)

  const showType = schema?.showType || 'select'

  // select 模式 - 使用旧版逻辑
  if (showType === 'select') {
    // 获取显示字段配置（从 schema.relate.fields[0]）
    const displayFieldConfig = schema?.relate?.fields?.[0]
    const displayFieldKey = displayFieldConfig?.key
    const fieldSchema = displayFieldConfig?.fieldSchema

    // 单选
    if (!isArray(parsedValue)) {
      let fieldValue = parsedValue?.[displayFieldKey]

      // 尝试解析 JSON 字符串
      if (isString(fieldValue)) {
        try {
          const parsed = JSON.parse(fieldValue)
          if (isObject(parsed) || isArray(parsed)) {
            fieldValue = parsed
          }
        } catch (e) {
          // 保持原值
        }
      }

      // 对于特定类型，直接显示原始值
      const directDisplayTypes = ['input', 'serialNumber', 'timePicker', 'dateRange', 'date-range']
      let displayValue: any
      if (directDisplayTypes.includes(fieldSchema?.fieldType) || directDisplayTypes.includes(fieldSchema?.type)) {
        displayValue = parsedValue?.[displayFieldKey]
      } else {
        // 使用 ViewFieldRender 渲染
        displayValue = (
          <ViewFieldRender
            value={fieldValue}
            schema={fieldSchema}
          />
        )
      }

      // 用 DetailShow 包裹
      return (
        <DetailShow schema={schema} value={parsedValue}>
          <span className="inline-block border rounded px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800">
            {displayValue}
          </span>
        </DetailShow>
      )
    }

    // 多选 - 遍历数组，用逗号分隔
    if (isArray(parsedValue)) {
      const items: React.ReactNode[] = []

      parsedValue.forEach((item: any, index: number) => {
        let fieldValue = item?.[displayFieldKey]

        // 尝试解析 JSON 字符串
        if (isString(fieldValue)) {
          try {
            const parsed = JSON.parse(fieldValue)
            if (isObject(parsed) || isArray(parsed)) {
              fieldValue = parsed
            }
          } catch (e) {
            // 保持原值
          }
        }

        // 对于特定类型，直接显示原始值
        const directDisplayTypes = ['input', 'serialNumber', 'timePicker']
        let displayValue: any
        if (directDisplayTypes.includes(fieldSchema?.fieldType) || directDisplayTypes.includes(fieldSchema?.type)) {
          displayValue = item?.[displayFieldKey]
        } else {
          // 使用 ViewFieldRender 渲染
          displayValue = (
            <ViewFieldRender
              value={fieldValue}
              schema={fieldSchema}
            />
          )
        }

        // 用 DetailShow 包裹每个项
        items.push(
          <DetailShow key={index} schema={schema} value={item}>
            <span className="inline-block border rounded px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800">
              {displayValue}
            </span>
          </DetailShow>
        )

        // 添加逗号分隔符（除了最后一项）
        if (index < parsedValue.length - 1) {
          items.push(<span key={`comma-${index}`}>, </span>)
        }
      })

      return <span className="inline-block">{items}</span>
    }
  }

  // Card 模式
  if (showType === 'card') {
    const items = isArray(parsedValue) ? parsedValue : [parsedValue]
    const processedItems = items.map(item => parseJsonStrings(item))

    // 列表中最多显示 6 条
    if (inList) {
      const displayItems = processedItems.slice(0, 6)
      return (
        <div className="flex flex-wrap">
          {displayItems.map((item: any, index: number) => (
            <ItemShow
              key={index}
              relateSchema={schema}
              val={item}
              field={{ displayField: schema?.displayField || 'name' }}
            />
          ))}
          {items.length > 6 && (
            <div className="text-blue-600 cursor-pointer text-sm ml-2 mt-3">
              +{items.length - 6} 条
            </div>
          )}
        </div>
      )
    }

    // 非列表模式，支持展开/收起
    const displayList = expand ? processedItems : processedItems.slice(0, 6)

    return (
      <div className="m-1">
        {displayList.map((item: any, index: number) => (
          <ItemShow
            key={index}
            relateSchema={schema}
            val={item}
            field={{ displayField: schema?.displayField || 'name' }}
            detailPage={schema?.detailPage}
          />
        ))}
        {items.length > 6 && (
          <div
            className="text-blue-600 cursor-pointer text-sm mt-2"
            onClick={() => setExpand(!expand)}
          >
            {expand ? (
              <>
                收起（共 {items.length} 条）
                <ChevronUp className="h-4 w-4 inline ml-1" />
              </>
            ) : (
              <>
                展开更多（共 {items.length} 条）
                <ChevronDown className="h-4 w-4 inline ml-1" />
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  // Table 模式
  if (showType === 'table') {
    const items = isArray(parsedValue) ? parsedValue : [parsedValue]
    return (
      <TableShow
        relateSchema={schema}
        val={items}
        field={{ displayField: schema?.displayField || 'name' }}
      />
    )
  }

  return null
}
