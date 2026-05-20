import * as React from 'react'
import isEmpty from 'lodash/isEmpty'
import isPlainObject from 'lodash/isPlainObject'
import isArray from 'lodash/isArray'
import pick from 'lodash/pick'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Repeat2 } from 'lucide-react'
import { useUser } from '@airiot/client'
import { createAPI } from '@airiot/client'
import { getFormValues, dealFilter, fieldRender } from '@/lib/form-relate-utils'
import type { RelateFieldProps } from '@/lib/form-relate-types'

interface RelateModelSelectProps extends RelateFieldProps {
  value?: any
  onChange?: (value: any) => void
  field: Record<string, any>
  label?: string
  schema?: any
  inputType?: 'select' | 'button'
  selectType?: 'single' | 'multiple'
  allFieldReturn?: boolean
  insideFilter?: any
}

/**
 * RelateModelSelect - 弹窗表格选择器
 * 外部工作表关联，多字段展示，弹窗选择
 */
const RelateModelSelect: React.FC<RelateModelSelectProps> = (props) => {
  const {
    value,
    onChange,
    field = {},
    label,
    disabled: propsDisabled,
    inputType = 'select',
    selectType = 'single',
    allFieldReturn = false,
  } = props

  const { relateShowFields, schema } = field
  const displayField = schema?.relate?.fields?.[0]?.key || 'name'

  // 获取表单状态
  const [formState] = React.useState<Record<string, any>>({})

  const disabled = propsDisabled || (schema as any)?.disabled || false

  // 弹窗状态
  const [visible, setVisible] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState<any[]>([])
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  // 默认值生效
  React.useEffect(() => {
    const defaultVal = (schema as any)?.defaultVal
    setTimeout(() => {
      if (!value && defaultVal && onChange) {
        onChange(defaultVal)
      }
    })
  }, [])

  // 字段脚本部分
  React.useEffect(() => {
    const values = getFormValues(schema, { values: formState })
    if (values && !isEmpty(values)) {
      // TODO: 实现字段脚本逻辑
      // useScriptVal({ schema: schema, value, values, record, onChange })
    }
  }, [JSON.stringify(formState)])

  // 多字段联动表单其他字段
  React.useEffect(() => {
    relateShowFields?.forEach((rsf: any) => {
      if (rsf.mapToCurrent && rsf.mapField && value?.[rsf.key]) {
        // TODO: 触发表单字段变化
        // form?.change(rsf.mapField, value[rsf.key])
      }
    })
  }, [JSON.stringify(value || {}), relateShowFields])

  // 加载数据
  const loadData = React.useCallback(async () => {
    if (!schema) return

    setLoading(true)
    let filterObj: any = {}

    dealFilter(filterObj, field, () => ({ values: formState }))

    try {
      const tableName = schema.name
      if (!tableName) {
        return
      }

      const extraFields = relateShowFields?.map((f: any) => f.key) || []

      // 创建 API 实例
      const api = createAPI({
        resource: tableName,
        name: 'relate'
      })

      // 使用 api.query 查询数据
      const { items } = await api.query(
        {
          limit: 100,
          fields: ['id', displayField, ...extraFields].filter(Boolean),
          ...Object.keys(filterObj).length > 0 && { search: filterObj }
        }
      )

      setData(items || [])
    } catch (error) {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [schema, JSON.stringify(field), JSON.stringify(formState), displayField, relateShowFields])

  // 打开弹窗时加载数据
  React.useEffect(() => {
    if (visible) {
      loadData()
    }
  }, [visible, loadData])

  // 格式化显示值
  const formatDisplayValue = (val: any): string => {
    if (!val) return ''
    if (isPlainObject(val)) {
      return val[displayField] || val.id || ''
    }
    return String(val)
  }

  // 单选确认
  const selectOne = (item: any) => {
    setVisible(false)

    if (allFieldReturn) {
      const val = { ...item }
      delete val.deletePermission
      delete val.editPermission
      onChange?.(val)
      return
    }

    const v = item[displayField]
    let r = v
      ? {
          id: item.id,
          [displayField]: v,
          ...pick(item, relateShowFields?.map((s: any) => s.key) || []),
        }
      : null

    if (field.displayField && item[field.displayField]) {
      (r as any)[field.displayField] = item[field.displayField]
    }

    v && onChange?.(r)
  }

  // 多选确认
  const selectMany = (selectedItems: any[]) => {
    setVisible(false)

    if (!selectedItems || selectedItems.length === 0) {
      onChange?.(null)
      return
    }

    let resultList: any[] = []

    selectedItems.forEach((item) => {
      if (allFieldReturn) {
        const val = { ...item }
        delete val.deletePermission
        delete val.editPermission
        resultList.push(val)
        return
      }

      const v = item[displayField]
      let r = v
        ? {
            id: item.id,
            [displayField]: v,
            ...pick(item, relateShowFields?.map((s: any) => s.key) || []),
          }
        : null

      if (field.displayField && item[field.displayField]) {
        (r as any)[field.displayField] = item[field.displayField]
      }

      v && resultList.push(r)
    })

    onChange?.(resultList)
  }

  // 获取当前选中的值（用于显示）
  const getSelectedDisplay = () => {
    if (selectType === 'multiple') {
      if (isArray(value) && value.length > 0) {
        return value.map((v: any) => formatDisplayValue(v)).join(', ')
      }
      return ''
    } else {
      return formatDisplayValue(value)
    }
  }

  const BtnIcon = value ? <Repeat2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />

  return (
    <>
      {inputType === 'button' ? (
        <Button disabled={disabled} onClick={() => !disabled && setVisible(true)} type="button">
          <span className="mr-2">{BtnIcon}</span>
          记录
        </Button>
      ) : (
        <div className="relative">
          <Input
            value={getSelectedDisplay()}
            placeholder={label}
            readOnly
            disabled={disabled}
            onClick={() => !disabled && setVisible(true)}
            className="cursor-pointer"
          />
          {value && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-3"
              onClick={() => onChange?.(null)}
              disabled={disabled}
            >
              ✕
            </Button>
          )}
        </div>
      )}

      <Dialog open={visible} onOpenChange={setVisible}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{label || '选择记录'}</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">加载中...</p>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">暂无数据</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 数据列表 */}
              <div className="border rounded-md">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      {selectType === 'multiple' && (
                        <th className="p-2 text-left w-12">
                          <input
                            type="checkbox"
                            checked={selectedIds.length === data.length && data.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds(data.map((item) => item.id))
                              } else {
                                setSelectedIds([])
                              }
                            }}
                          />
                        </th>
                      )}
                      <th className="p-2 text-left">{displayField}</th>
                      {relateShowFields?.map((f: any) => (
                        <th key={f.key} className="p-2 text-left">
                          {f.title}
                        </th>
                      ))}
                      {selectType === 'single' && <th className="p-2 text-left w-20">操作</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-muted/50">
                        {selectType === 'multiple' && (
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds([...selectedIds, item.id])
                                } else {
                                  setSelectedIds(selectedIds.filter((id) => id !== item.id))
                                }
                              }}
                            />
                          </td>
                        )}
                        <td className="p-2">{item[displayField]}</td>
                        {relateShowFields?.map((f: any) => (
                          <td key={f.key} className="p-2">
                            {fieldRender(item[f.key], f.fieldSchema)}
                          </td>
                        ))}
                        {selectType === 'single' && (
                          <td className="p-2">
                            <Button size="sm" variant="outline" onClick={() => selectOne(item)}>
                              选择
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setVisible(false)} type="button">
              取消
            </Button>
            {selectType === 'multiple' && (
              <Button
                onClick={() => {
                  const selectedItems = data.filter((item) => selectedIds.includes(item.id))
                  selectMany(selectedItems)
                }}
                type="button"
              >
                确定
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { RelateModelSelect }
