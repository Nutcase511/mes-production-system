import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ViewModel from '@/components/kesi/view-model/view-model'
import { ViewDataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import Actions, { CreateAction, ViewAction, EditAction, DeleteAction } from '@/components/kesi/view-actions/view-actions'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { useModel, useModelGetItems, createAPI } from '@airiot/client'
import { useModelListWithOptions } from '@/hooks/useModelListSafe'
import { LoadingDots } from '@/components/ui/loading-dots'
import { ViewFilter } from '@/components/kesi/view-filter/view-filter'

const tableId = '生产计划'

const filterFields = [
  {
    key: 'check-code',
    name: 'check-code',
    title: '质检单号',
    fieldType: 'filter_string',
    orientation: 'horizontal' as const,
  },
  {
    key: 'delivery-code',
    name: 'delivery-code',
    title: '送货单号',
    fieldType: 'filter_string',
    orientation: 'horizontal' as const,
  },
  {
    key: 'supplier',
    name: 'supplier',
    title: '供应商',
    fieldType: 'filter_string',
    orientation: 'horizontal' as const,
  },
  {
    key: 'result',
    name: 'result',
    title: '检验结果',
    fieldType: 'filter_enum',
    orientation: 'horizontal' as const,
  },
]

const PageContent = () => {
  const { model } = useModel()
  const { items, loading } = useModelListWithOptions({ initQuery: false })
  const { getItems } = useModelGetItems()

  // 初始化查询：从 schema 获取所有字段，只查询外协类型的跟单
  const initializedRef = useRef(false)
  useEffect(() => {
    if (model?.properties && !initializedRef.current) {
      initializedRef.current = true
      const fields = Object.keys(model.properties)

      const query = {
        fields: fields,
        filters: [
          {
            field: 'select-0362',
            operator: 'eq',
            value: '1'
          }
        ]
      }
      getItems(query)
    }
  }, [model])

  // 构建查询参数（用于搜索和重置）
  const buildQuery = (extraFilters: any[] = []) => {
    const fields = Object.keys(model?.properties || {})

    return {
      fields: fields,
      filters: [
        {
          field: 'select-0362',
          operator: 'eq',
          value: '1'
        },
        ...extraFilters
      ]
    }
  }

  return (
    <>
            {/* 过滤器 */}
      <ViewFilter
        filters={filterFields}
        classNames={{
          form: 'flex flex-row items-end gap-4 flex-wrap w-full',
          group: 'flex flex-row items-end gap-4 flex-1 min-w-0',
          field: 'w-auto',
          label: 'text-blue-200 whitespace-nowrap',
          input: 'bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50 w-auto',
          description: '',
          error: ''
        }}
      />
      {loading ? (
        <LoadingDots text="加载中..." />
      ) : (
        <>
          <ViewDataTable
            data={items as any[]}
            tableLayout={{ border: true, headerSticky: true, columnsResizable: true, stripped: true, dense: false }}
            gridOptions={{}}
          >
            <TableColumn name="check-code" title="质检单号" width={150} />
            <TableColumn name="delivery-code" title="送货单号" width={150} />
            <TableColumn name="supplier" title="供应商" width={180} />
            <TableColumn name="material-code" title="物料编码" width={120} />
            <TableColumn name="material-name" title="物料名称" width={180} />
            <TableColumn name="check-quantity" title="检验数量" width={100} />
            <TableColumn name="qualified-quantity" title="合格数量" width={100} />
            <TableColumn name="unqualified-quantity" title="不合格数" width={100} />
            <TableColumn name="check-date" title="检验日期" width={120} />
            <TableColumn name="checker" title="检验员" width={100} />
            <TableColumn name="result" title="检验结果" width={100}>
              {(props) => {
                const value = props.value
                const colorMap: Record<string, string> = {
                  '合格': 'bg-green-500/20 text-green-400',
                  '不合格': 'bg-red-500/20 text-red-400',
                  '特采': 'bg-yellow-500/20 text-yellow-400',
                  '返工': 'bg-orange-500/20 text-orange-400',
                  '待检': 'bg-gray-500/20 text-gray-400',
                }
                return (
                  <Badge className={colorMap[value] || 'bg-gray-500/20 text-gray-400'}>
                    {value || '-'}
                  </Badge>
                )
              }}
            </TableColumn>
            <TableColumn name="__actions__" title="操作" fixed="right" width={100}>{(props) => <div className="flex items-center gap-1">
            <ViewAction itemId={props.item.id}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
            </ViewAction>
            <EditAction itemId={props.item.id}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
            </EditAction>
            <DeleteAction itemId={props.item.id}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DeleteAction>
          </div>}</TableColumn>
          </ViewDataTable>
          <div className="p-4"><ViewPagination showTotal={true} showSizeChanger={true} showQuickJumper={true} pageSizeOptions={[10, 20, 50, 100]} /></div>
        </>
      )}
    </>
  )
}

export function QualityCheckPage() {
  const [queryFields, setQueryFields] = React.useState<string[] | undefined>(undefined)

  React.useEffect(() => {
    createAPI({ resource: `core/t/schema/${encodeURIComponent(tableId)}` }).fetch('')
      .then((res: any) => {
        const schema = res?.schema || res
        if (schema?.properties) {
          setQueryFields(Object.keys(schema.properties))
        }
      })
  }, [])

  return (
    <div className="space-y-0">
      <ViewModel
        tableId={tableId}
        initQuery={false}
        queryFields={queryFields}
        tableFilters={{
          'select-0362': '1'
        }}
      >
        <PageContent />
      </ViewModel>
    </div>
  )
}

export default QualityCheckPage
