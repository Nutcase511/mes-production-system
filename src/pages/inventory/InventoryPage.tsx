import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useModel, useModelGetItems, createAPI } from '@airiot/client'
import { useModelListWithOptions } from '@/hooks/useModelListSafe'

import ViewModel from '@/components/kesi/view-model/view-model'
import { ViewDataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import Actions, { CreateAction, ViewAction, EditAction, DeleteAction } from '@/components/kesi/view-actions/view-actions'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { ViewFilter } from '@/components/kesi/view-filter/view-filter'
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
  const { items, loading } = useModelListWithOptions({ initQuery: false })
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

  return (
    <>
      {/* 过滤器卡片 */}
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

      {/* 数据表格 */}
      {loading ? (
        <LoadingDots text="加载中..." />
      ) : (
        <ViewDataTable
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
          gridOptions={{}}
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
          <TableColumn name="__actions__" title="操作" fixed="right" width={100}>
            {(props) => <div className="flex items-center gap-1">
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
          </div>}
          </TableColumn>
        </ViewDataTable>
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
      <ViewModel tableId={tableId} initQuery={false} queryFields={queryFields}>
        <InventoryContent />
      </ViewModel>
    </div>
  )
}

export default InventoryPage
