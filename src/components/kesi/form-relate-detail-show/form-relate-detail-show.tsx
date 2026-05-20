import * as React from 'react'
import isEmpty from 'lodash/isEmpty'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { useUser } from '@airiot/client'
import { createAPI } from '@airiot/client'
import { fieldRender } from '@/lib/form-relate-utils'

interface DetailShowProps {
  children?: React.ReactNode
  schema?: any
  value?: any
  fieldRender?: (app: any) => (component: any, schema: any) => (props: any) => React.ReactNode
  inList?: boolean
}

/**
 * DetailShow - 详情展示组件
 * 支持在列表中展示关联数据的详情
 * 可以通过 popover、modal、或跳转页面展示
 */
const DetailShow: React.FC<DetailShowProps> = ({
  children,
  schema,
  value,
  fieldRender: customFieldRender,
  inList = false,
}) => {
  const [visible, setVisible] = React.useState(false)
  const [detailData, setDetailData] = React.useState<Array<{ title: string; value: any }>>([])
  const [loading, setLoading] = React.useState(false)

  // 获取详情数据
  const getDetailData = async () => {
    if (!value?.id || !schema?.relate?.id) {
      return
    }

    setLoading(true)

    try {
      // 创建 schema API 实例
      const schemaAPI = createAPI({
        resource: 'core/t/schema',
        name: 'schema'
      })

      // 获取关联表的结构
      const relateTable = await schemaAPI.get(schema.relate.id)

      if (!relateTable || !relateTable.schema) {
        setLoading(false)
        return
      }

      // 创建数据 API 实例
      const dataAPI = createAPI({
        resource: `core/t/${schema.relate.id}/d`,
        name: 'data'
      })

      // 获取记录详情
      const data = await dataAPI.get(value.id)

      setLoading(false)

      if (isEmpty(data)) {
        return
      }

      // 构建详情数据
      const result: Array<{ title: string; value: any }> = []

      if (schema.recordDetail?.showField) {
        schema.recordDetail.showField.forEach((key: string) => {
          const fieldSchema = relateTable.schema.properties[key]
          let fieldValue = data?.[key]

          // 使用自定义 fieldRender 或默认 fieldRender
          if (customFieldRender && customFieldRender(null)(null, fieldSchema)) {
            fieldValue = customFieldRender(null)(null, fieldSchema)({
              value: fieldValue,
              wrap: 'span',
            })
          } else {
            fieldValue = fieldRender(fieldValue, fieldSchema)
          }

          const title = fieldSchema?.title || key
          result.push({ title, value: fieldValue })
        })
      } else if (schema.relateShowFields?.length > 0) {
        // 使用 relateShowFields
        schema.relateShowFields.forEach((field: any) => {
          const fieldValue = data?.[field.key]
          result.push({
            title: field.title,
            value: fieldRender(fieldValue, field.fieldSchema),
          })
        })
      }

      setDetailData(result)
    } catch (error) {
      setLoading(false)
    }
  }

  if (!value?.id) {
    return <>{children || ''}</>
  }

  // Popover 模式
  if (schema.recordDetail?.showType === 'popover') {
    const content = loading ? (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    ) : (
      <div className="max-h-[500px] overflow-y-auto">
        {detailData.map((item, index) => (
          <div key={index} className="flex py-2 min-h-[35px]">
            <span className="w-24 text-muted-foreground flex-shrink-0">{item.title}：</span>
            <span className="flex-1">{item.value}</span>
          </div>
        ))}
      </div>
    )

    return (
      <Popover>
        <PopoverTrigger asChild>
          <span className="detail-span cursor-pointer underline" onClick={getDetailData}>
            {children}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-[500px]" align="start">
          {content}
        </PopoverContent>
      </Popover>
    )
  }

  // Modal 模式
  if (schema.recordDetail?.showType === 'modal') {
    return (
      <>
        <span
          className="detail-span cursor-pointer underline"
          onClick={() => {
            getDetailData()
            setVisible(true)
          }}
        >
          {children}
        </span>

        {visible && (
          <Dialog open={visible} onOpenChange={setVisible}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>记录详情</DialogTitle>
              </DialogHeader>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {detailData.map((item, index) => (
                    <div key={index} className="flex py-2 min-h-[35px]">
                      <span className="w-48 text-muted-foreground flex-shrink-0">{item.title}：</span>
                      <span className="flex-1">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setVisible(false)} type="button">
                  关闭
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </>
    )
  }

  // Page 模式 - TODO: 需要实现路由跳转
  if (schema.recordDetail?.showType === 'page') {
    return (
      <span
        className="detail-span cursor-pointer underline"
        onClick={() => {
          // TODO: 实现页面跳转
          // app.go(`/app/table/${schema?.relate?.id}/${value?.id}/detail`)
        }}
      >
        {children}
      </span>
    )
  }

  // Card 模式
  if (schema.relateShowFields?.length > 0 && schema.showType === 'card') {
    const content = (
      <div className="inline-block bg-muted p-3 rounded-md m-1 min-w-[300px]">
        <div className="flex py-1">
          <span className="w-24 text-muted-foreground flex-shrink-0">记录编号：</span>
          <span>{value.id}</span>
        </div>
        {schema.relateShowFields.map((f: any) => (
          <div key={f.key} className="flex py-1">
            <span className="w-24 text-muted-foreground flex-shrink-0">{f.title}：</span>
            <span>{fieldRender(value[f.key], f.fieldSchema)}</span>
          </div>
        ))}
      </div>
    )

    if (inList) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <span className="cursor-pointer">{children || ''}</span>
          </PopoverTrigger>
          <PopoverContent>{content}</PopoverContent>
        </Popover>
      )
    } else {
      return <>{content}</>
    }
  }

  return <>{children || ''}</>
}

export { DetailShow }
