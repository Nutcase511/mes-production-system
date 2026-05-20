import React, { cloneElement, useEffect, useMemo, useState } from 'react';
import { useModelList, useModel, useModelState } from '@airiot/client'
import type { FieldProperty, ModelSchema } from '@/lib/model-types'
import { DataGrid } from '@/components/reui/data-grid/data-grid';
import { DataGridColumnHeader } from '@/components/reui/data-grid/data-grid-column-header';
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/components/reui/data-grid/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  type ColumnDef, type TableOptions, type CellContext, type SortingState, type RowSelectionState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { tableConverter } from '@/lib/view-table-converter'

declare module '@tanstack/react-table' {
  interface ColumnDefBase<TData, TValue> {
    field?: Record<string, any>;
  }
}

interface TableFieldSchema {
  key: string
  title?: string
  type?: string
  width?: number
  height?: number
  sort?: number
  widthInForm?: number
  tableFixed?: boolean | 'left' | 'right'
  canOrder?: boolean
  level2?: string
  column?: Record<string, any>
  afterNow?: boolean | string
  timeFormat?: string
  allowSelectOld?: boolean | string
  allowAdd?: boolean | string
  highTableFields?: any
  btnText?: string
  displayForm?: any
  cardLayout?: any
  showPagination?: boolean | string
  uniqueRow?: boolean | string
  uniqueFields?: string[]
  fieldRules?: any
  createAddBtn?: boolean | string
  editAddBtn?: boolean | string
  createDelBtn?: boolean | string
  editDelBtn?: boolean | string
  onlyCamera?: boolean | string
  canDownload?: boolean | string
  areaType?: string
  count?: number
  showType?: string
  canEdit?: boolean | string
  linkType?: string
  placeholder?: string
  checkedChildren?: string
  unCheckedChildren?: string
  manualChange?: boolean | string
  selectType?: string
  selectFace?: string
  treeMark?: boolean | string
  recordSelectType?: string
  dateFormat?: string
  dateType?: string
  format?: string
  filedFormat?: string
  filterMode?: string
  [key: string]: any
}

interface IData {
  id: string;
  [key: string]: any;
}

export interface TableLayoutProps {
  border?: boolean;
  dense?: boolean;
  cellBorder?: boolean;
  rowBorder?: boolean;
  rowRounded?: boolean;
  stripped?: boolean;
  headerBackground?: boolean;
  headerBorder?: boolean;
  headerSticky?: boolean;
  width?: 'auto' | 'fixed';
  layout?: 'auto' | 'fixed';
  columnsVisibility?: boolean;
  columnsResizable?: boolean;
  columnsPinnable?: boolean;
  columnsMovable?: boolean;
  columnsDraggable?: boolean;
  rowsDraggable?: boolean;
}

const getFieldProp = (model: ModelSchema | null | undefined, field: string): FieldProperty | undefined => {
  if (!model) return undefined
  return field.split('.').reduce((obj: any, f: string) => {
    return obj && obj.properties && obj.properties[f]
  }, model)
}

const DataCell = ({ children, schema, tableSchema, ...restProps }:
  {
    children?: React.ReactNode | ((props: any) => React.ReactNode), [key: string]: any
  }) =>
  ({ getValue, row, column }: CellContext<IData, any>) => {

    const baseSchema = schema || column.columnDef?.field

    const childrenProps = {
      ...restProps,
      value: getValue(),
      item: row.original,
      schema: { ...baseSchema, ...(tableSchema || {}) },
      tableSchema,
    }
    
    const FieldComponent = tableConverter(baseSchema, tableSchema)

    return (
      children ? (typeof children === 'function' ? children(childrenProps) : cloneElement(children as React.ReactElement<any>, childrenProps)) : (
        <FieldComponent {...childrenProps} />
      )
    )
  }

export const DataTable = ({
  data,
  columns = [],
  className,
  tableLayout = {},
  tableOptions = {},
  gridOptions = {},
  children
}: {
  data: IData[],
  className?: string,
  tableLayout?: TableLayoutProps,
  tableOptions?: Omit<TableOptions<IData>, 'data' | 'columns' | 'getCoreRowModel'>,
  columns?: ColumnDef<IData>[]
  gridOptions: Omit<React.ComponentProps<typeof DataGrid>, 'table' | 'recordCount' | 'tableLayout'>
  children?: React.ReactElement[] | React.ReactElement | undefined
}) => {
  const { withColumns, getColumns } = useTableContainer(children);
  const defColumns: ColumnDef<IData>[] = getColumns();
  const columnsFinal = [] as ColumnDef<IData>[];

  columns.forEach(column => {
    const defColumn = defColumns.find(col => col.id === column.id);
    if (defColumn) {
      Object.assign(column, defColumn)
      defColumns.splice(defColumns.indexOf(defColumn), 1)
    }
    columnsFinal.push(column);
  })
  defColumns.forEach(col => {
    columnsFinal.push(col);
  })

  const table = useReactTable({
    columns: columnsFinal,
    data: data,
    getRowId: (row: IData) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: 'onChange',
    ...tableOptions,
  });

  // 合并默认 tableLayout 和传入的 tableLayout
  const defaultTableLayout: TableLayoutProps = {
    border: true,
    columnsResizable: true,
    columnsPinnable: true,
    headerSticky: true,
    rowBorder: true,
    cellBorder: false,
    headerBorder: true,
    width: 'fixed'
  }

  const mergedTableLayout = { ...defaultTableLayout, ...tableLayout }

  return withColumns(
    <DataGrid table={table} recordCount={data?.length || 0}
      tableLayout={mergedTableLayout}
      {...gridOptions}>
      <div data-slot="data-grid" className={cn('w-full', mergedTableLayout.border && 'border border-border rounded-lg', className)}>
        <ScrollArea>
          <DataGridTable />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </DataGrid>
  );
}

export function ViewDataTable({
  className,
  tableLayout = {},
  tableOptions = {},
  gridOptions = {},
  showCheckbox = true,
  children
}: {
  className?: string,
  tableLayout?: TableLayoutProps,
  tableOptions?: Omit<TableOptions<IData>, 'data' | 'columns' | 'getCoreRowModel'>,
  columns?: ColumnDef<IData>[]
  gridOptions?: Omit<React.ComponentProps<typeof DataGrid>, 'table' | 'recordCount' | 'tableLayout'>
  showCheckbox?: boolean
  children?: React.ReactElement[] | React.ReactElement | undefined
}) {
  const { items, loading, fields } = useModelList()
  const { model, atoms } = useModel()

  const [order, setOrder] = useModelState(atoms.order)
  const [sorting, setSorting] = useState<SortingState>([])

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selected, setSelected] = useModelState<{ id: string }[]>(atoms.selected)

  const columnHelper = createColumnHelper<IData>()
  const columns: ColumnDef<IData>[] = []

  fields.forEach((tableSchema: string | TableFieldSchema) => {
    if (typeof tableSchema === 'string') tableSchema = { key: tableSchema }
    const fieldName = tableSchema.key
    const baseSchema = getFieldProp(model, fieldName)
    const field = { ...baseSchema, ...(typeof tableSchema === 'object' ? tableSchema : { key: tableSchema }) }
    if (!field) return
    const column: ColumnDef<IData> = columnHelper.accessor(fieldName, {
      id: fieldName,
      field,
      size: field.width || undefined,
      fixed: field.tableFixed,
      enableSorting: Boolean(field.canOrder),
      header: ({ column }) => {
        return <DataGridColumnHeader title={field.title || fieldName} column={column} />
      },
      cell: DataCell({
        name: fieldName,
        schema: baseSchema,
        tableSchema,
        inList: true,
        type: field.type as string,
        ...field.column
      }),
      ...field.column
    })

    if (field.level2) {
      const lastColumn = columns[columns.length - 1] as any
      if (lastColumn && lastColumn.columns !== undefined &&
        lastColumn.header == field.level2) {
        lastColumn.columns.push(column)
      } else {
        columns.push({
          header: field.level2,
          columns: [column]
        })
      }
    } else {
      columns.push(column)
    }
  })

  // 配置行选择
  const onRowSelectionChange = (handler: (state: RowSelectionState) => RowSelectionState) => {
    const newSelection = handler(rowSelection)
    setSelected(items.filter(item => newSelection[item.id]));
  }

  useEffect(() => {
    setRowSelection(selected.reduce((obj: Record<string, boolean>, item: any) => {
      obj[item.id] = true;
      return obj;
    }, {}));
  }, [selected]);

  if (showCheckbox) {
    columns.unshift({
      accessorKey: 'id',
      header: () => <DataGridTableRowSelectAll />,
      cell: ({ row }) => <DataGridTableRowSelect row={row} />,
      enableSorting: false,
      enableResizing: false,
      size: 35,
      meta: {
        headerClassName: '',
        cellClassName: '',
      },
    })
  }

  // 配置排序
  const onSortingChange = (handler: (state: SortingState) => SortingState) => {
    const newSorting = handler(sorting)
    // 转换为 order 格式
    const newOrder: Record<string, 'asc' | 'desc'> = {}
    newSorting.forEach(sort => {
      newOrder[sort.id] = sort.desc ? 'desc' : 'asc'
    })
    // 更新模型状态
    setOrder(newOrder)
  }

  useEffect(() => {
    setSorting(Object.keys(order || {}).map(key => ({
      id: key,
      desc: order ? order[key]?.toLowerCase() === 'desc' : false,
      asc: order ? order[key]?.toLowerCase() === 'asc' : false
    })));
  }, [order]);

  const tableProps = model.dataTableProps ? (
    typeof model.dataTableProps == 'function' ?
      model.dataTableProps(columns, items) : model.dataTableProps
  ) : {}

  return <DataTable
    data={items as IData[]}
    columns={columns}
    className={className}
    tableLayout={tableLayout}
    gridOptions={{
      loadingMode: 'spinner',
      loadingMessage: '数据加载中...',
      emptyMessage: '暂无数据',
      ...gridOptions,
      isLoading: loading
    }}
    tableOptions={{
      ...tableProps,
      ...tableOptions,
      initialState: {
        ...tableOptions.initialState,
        columnPinning: {
          left: showCheckbox ? ['id'] : [],
          right: ['__actions__'],
        },
      },
      // 添加排序配置
      state: {
        ...(tableOptions.state || {}),
        sorting,
        ...(showCheckbox ? { rowSelection } : {}),
      },
      ...(showCheckbox ? { onRowSelectionChange, enableRowSelection: true } : {}),
      onSortingChange
    }}
  >{children}</DataTable>;
}

// TableColumn 组件 - 用于定义和配置列
interface TableColumnProps {
  name: string;
  title?: string;
  width?: number;
  fixed?: boolean | 'left' | 'right';
  header?: React.ReactNode;
  cell?: React.ReactNode;
  type?: string;
  level2?: string;
  children?: React.ReactNode | ((props: any) => React.ReactNode);
  [key: string]: any;
}

interface ColumnContextValue {
  columns: Map<string, ColumnDef<IData>>;
  setColumn: (name: string, column: ColumnDef<IData>) => void;
  getColumn: (name: string) => ColumnDef<IData> | undefined;
  getColumns: () => ColumnDef<IData>[];
}

const ColumnContext = React.createContext<ColumnContextValue | null>(null);

const useTableContainer = (children: React.ReactElement[] | React.ReactElement | undefined) => {
  const columns = React.useRef<Map<string, ColumnDef<IData>>>(new Map());
  const [inited, setInited] = React.useState<boolean>(false);

  // 设置列
  const setColumn = (name: string, column: ColumnDef<IData>) => {
    columns.current.set(name, column);
  };

  // 获取单个列
  const getColumn = (name: string): ColumnDef<IData> | undefined => {
    return columns.current.get(name);
  };

  // 获取所有列（按定义顺序）
  const getColumns = (): ColumnDef<IData>[] => {
    return Array.from(columns.current.values());
  };

  const contextValue: ColumnContextValue = {
    columns: columns.current,
    setColumn,
    getColumn,
    getColumns,
  };

  React.useEffect(() => {
    if (!inited)
      setInited(true);
  }, []);

  const withColumns = React.useCallback((table: React.ReactElement) => (
    <ColumnContext.Provider value={contextValue}>
      {useMemo(() => children, [])}
      {inited && table}
    </ColumnContext.Provider>
  ), [children, contextValue, inited])

  return { withColumns, getColumns };
}

export const TableColumn: React.FC<TableColumnProps> = ({
  name,
  title,
  width,
  header,
  cell,
  level2,
  children,
  ...columnProps
}) => {
  const columnContext = React.useContext(ColumnContext);

  if (!columnContext) {
    return null;
  }

  React.useEffect(() => {
    const columnDef: ColumnDef<IData> = {
      id: name,
      accessorKey: name,
      header: header ? header as any : (({ column }) => <DataGridColumnHeader title={title || name} column={column as any} />),
      size: width as number | undefined,
      cell: cell ? cell as any : DataCell({ children, ...columnProps }),
      ...columnProps
    };

    columnContext.setColumn(name, columnDef);
  }, [name, title, children, width, header, cell, level2, columnContext, columnProps]);

  return null;
};