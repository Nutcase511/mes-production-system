// @ts-ignore
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useModel, useModelState, useModelGetItems, useModelList } from '@airiot/client'

import ViewModel from '@/components/kesi/view-model/view-model'
import { DataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import Actions, { CreateAction } from '@/components/kesi/view-actions/view-actions'
import FilterSchemaForm from '@/components/kesi/filter-form/filter-form'
import { LoadingDots } from '@/components/ui/loading-dots'
import _ from 'lodash'

const tableId = '库存总表'

const filterFields = [
  {
    key: 'material-code',
    name: 'material-code',
    title: '物料编码',
    fieldType: 'filter_string',
    orientation: 'horizontal' as const,
  },
  {
    key: 'material-name',
    name: 'material-name',
    title: '物料名称',
    fieldType: 'filter_string',
    orientation: 'horizontal' as const,
  },
  {
    key: 'warehouse',
    name: 'warehouse',
    title: '仓库',
    fieldType: 'filter_enum',
    orientation: 'horizontal' as const,
  },
]

const InventoryContent: React.FC = () => {
  const { model } = useModel()
  const { items, loading } = useModelList({ initQuery: false })
  const [wheres, setWheres] = useModelState('wheres')
  const { getItems } = useModelGetItems()

  const properties = _.mapValues(model.properties || {}, (prop, key) => ({ ...prop, name: key }))

  // 初始化查询：从 schema 获取所有字段
  const initializedRef = useRef(false)
  useEffect(() => {
    if (model?.properties && !initializedRef.current) {
      initializedRef.current = true
      const fields = Object.keys(model.properties)
      const query = {
        fields: fields,
        withCount: true
      }
      getItems(query)
    }
  }, [model])

  // 构建查询参数（用于搜索和重置）
  const buildQuery = (extraFilters: any[] = []) => {
    const fields = Object.keys(model?.properties || {})
    return {
      fields: fields,
      withCount: true,
      filters: extraFilters
    }
  }

  const onSubmit = (value: any) => {
    const newWheres = { ...(wheres || {}), filter: { ...(wheres?.filter || {}), ...value } }
    setWheres(newWheres)

    // 将用户的搜索条件转换为 filters 格式
    const userFilters = Object.entries(value)
      .filter(([, val]) => val !== undefined && val !== '')
      .map(([key, val]) => ({
        field: key,
        operator: 'like',
        value: val
      }))

    const query = buildQuery(userFilters)
    getItems(query)
  }

  const onReset = (reset: () => void) => {
    reset()
    const newWheres = { ...(wheres || {}), filter: {} }
    setWheres(newWheres)
    const query = buildQuery()
    getItems(query)
  }

  return (
    <>
      {/* 过滤器卡片 */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4 mb-4" style={{
        borderColor: 'rgba(59, 130, 246, 0.3)'
      }}>
        <FilterSchemaForm
          formId="inventory-filter"
          schema={{ ...model, properties }}
          formSchema={filterFields}
          onSubmit={onSubmit}
          classNames={{
            form: 'flex flex-row items-end gap-4 flex-wrap w-full',
            group: 'flex flex-row items-end gap-4 flex-1 min-w-0',
            field: 'w-auto',
            label: 'text-blue-200 whitespace-nowrap',
            input: 'bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50 w-auto',
            description: '',
            error: '',
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
                  + 新建库存
                </Button>
              </CreateAction>
            </div>
          )}
        </FilterSchemaForm>
      </Card>

      {/* 数据表格 */}
      {loading ? (
        <LoadingDots text="加载中..." />
      ) : (
        <DataTable
          data={items as any[]}
          tableLayout={{
            border: true,
            headerSticky: true,
            columnsResizable: true,
            columnsPinnable: true,
            stripped: true,
            dense: false,
          }}
          tableOptions={{
            initialState: {
              columnPinning: {
                right: ['__actions__']
              }
            }
          }}
        >
          <TableColumn name="material-code" title="物料编码" width={120} />
          <TableColumn name="material-name" title="物料名称" width={180} />
          <TableColumn name="specification" title="规格" width={150} />
          <TableColumn name="warehouse" title="仓库" width={120} />
          <TableColumn name="location" title="库位" width={120} />
          <TableColumn name="quantity" title="库存数量" width={100} />
          <TableColumn name="unit" title="单位" width={80} />
          <TableColumn name="safety-stock" title="安全库存" width={100} />
          <TableColumn name="status" title="状态" width={100}>
            {(props) => {
              const value = props.value
              const colorMap: Record<string, string> = {
                '正常': 'bg-green-500/20 text-green-400',
                '预警': 'bg-yellow-500/20 text-yellow-400',
                '不足': 'bg-red-500/20 text-red-400',
                '超量': 'bg-orange-500/20 text-orange-400',
              }
              return (
                <Badge className={colorMap[value] || 'bg-gray-500/20 text-gray-400'}>
                  {value || '-'}
                </Badge>
              )
            }}
          </TableColumn>
          <TableColumn name="__actions__" title="操作" fixed="right" width={90}>
            {(props) => <Actions item={props.item} actions={['view', 'edit', 'delete']} variant="buttons" />}
          </TableColumn>
        </DataTable>
      )}

      <div className="p-4">
        <ViewPagination
          showTotal={true}
          showSizeChanger={true}
          showQuickJumper={true}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </div>
    </>
  )
}

export function InventoryPage() {
  return (
    <div className="space-y-0">
      <ViewModel tableId={tableId} initQuery={false}>
        <InventoryContent />
      </ViewModel>
    </div>
  )
}

export default InventoryPage
