// @ts-ignore
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ViewModel from '@/components/kesi/view-model/view-model'
import { DataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import Actions, { CreateAction } from '@/components/kesi/view-actions/view-actions'
import { useModel, useModelState, useModelGetItems, useModelList , createAPI } from '@airiot/client'
import { LoadingDots } from '@/components/ui/loading-dots'
import FilterSchemaForm from '@/components/kesi/filter-form/filter-form'

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
  const { items, loading } = useModelList({ initQuery: false })
  const { getItems } = useModelGetItems()
  const [wheres, setWheres] = useModelState('wheres')

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

  const onSubmit = (value: any) => {
    const newWheres = { ...(wheres || {}), filter: { ...(wheres?.filter || {}), ...value } }
    setWheres(newWheres)

    // 将用户的搜索条件转换为 filters 格式
    const userFilters = Object.entries(value).map(([key, val]) => ({
      field: key,
      operator: 'like',
      value: val
    }))

    const query = buildQuery(userFilters)
    getItems(query)
  }

  const onReset = (reset: () => void) => {
    reset()
    setWheres({ ...(wheres || {}), filter: {} })
    const query = buildQuery()
    getItems(query)
  }

  return (
    <>
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4 mb-4" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <FilterSchemaForm
          formId="quality-check-filter"
          schema={{ ...model, properties: model?.properties || {} }}
          formSchema={filterFields}
          onSubmit={onSubmit}
          classNames={{
            form: 'flex flex-row items-end gap-4 w-full',
            group: '!flex !flex-row !items-end !gap-4',
            field: '!flex !flex-row !items-center !gap-2 !w-auto',
            label: 'text-blue-200 whitespace-nowrap !w-[90px] !flex-none text-sm',
            input: '!w-auto !min-w-[240px]',
            description: '',
            error: '',
            orientation: 'horizontal',
          }}
        >
          {(methods) => (
            <div className="flex items-center gap-2">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 h-9 text-sm">
                搜索
              </Button>
              <Button type="button" variant="outline" className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20 px-4 py-1.5 h-9 text-sm" onClick={() => onReset(methods.reset)}>
                重置
              </Button>
              <CreateAction modelId={tableId}>
                <Button className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] px-4 py-1.5 h-9 text-sm">
                  + 新建质检记录
                </Button>
              </CreateAction>
            </div>
          )}
        </FilterSchemaForm>
      </Card>
      {loading ? (
        <LoadingDots text="加载中..." />
      ) : (
        <>
          <DataTable
            data={items as any[]}
            tableLayout={{ border: true, headerSticky: true, columnsResizable: true, stripped: true, dense: false }}
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
            <TableColumn name="__actions__" title="操作" fixed="right" width={130}>{(props) => <Actions item={props.item} actions={['view', 'edit', 'delete']} variant="buttons" />}</TableColumn>
          </DataTable>
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
