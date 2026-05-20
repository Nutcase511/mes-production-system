export interface FieldProperty {
  title: string
  type: string
  key: string
  controlType: string
  need?: boolean
  size?: string
  defaultVal?: any
  dbType?: string
  decimal?: number | null
  textContent?: string
  pattern?: string
  properties?: Record<string, any>
  items?: any
  enum?: any[]
  enumNames?: any[]
  metricStore?: boolean
  relateTo?: string
  userType?: string
  relate?: any
  relateShowFields?: any
  showField?: any
  insideFilter?: any[]
  formSchema?: any[]
  accept?: string
  sort?: string
  styleType?: string
  uploadPosition?: string
  listFields?: boolean
  canOrder?: boolean
  [key: string]: any
}

/** 表单 Schema 项 - 对应 formSchema 数组中的每一项 */
export interface FormSchemaItemBase {
  key: string
  widthInForm?: string | number
  areaType?: string
  displayForm?: string
  filterMode?: string
  format?: string
  dateFormat?: string
  linkType?: string
  showType?: string
  canEdit?: boolean
  selectFace?: string
  selectType?: string
  treeMark?: boolean
  allowAdd?: boolean
  allowSelectOld?: boolean
  count?: string
  timeFormat?: string
  btnText?: Record<string, string>
  createAddBtn?: { show: boolean; userRange: string }
  createDelBtn?: { show: boolean; userRange: string }
  editAddBtn?: { show: boolean; userRange: string }
  editDelBtn?: { show: boolean; userRange: string }
  controlType?: string
  [key: string]: any
}

/** 表单 Schema 项（支持 '*' 通配符） */
export type FormSchemaItem = FormSchemaItemBase | '*'

/** 表格 Schema 项 - 对应 tableSchema 数组中的每一项 */
export interface TableSchemaItem {
  key: string
  canOrder?: boolean
  listFields?: boolean
  lngLat?: boolean
  positionName?: boolean
  NullShow?: string
  listShow?: string
  [key: string]: any
}

/** 筛选 Schema 项 - 对应 filterSchema 数组中的每一项 */
export interface FilterSchemaItem {
  key: string
  [key: string]: any
}

/** 模型 Schema - 对应 Model 组件的 schema 对象 */
export interface ModelSchema {
  atoms?: Record<string, any>
  type?: string
  title?: string
  key?: string
  name?: string
  icon?: string
  properties?: Record<string, FieldProperty>
  required?: string[]
  formSchema?: FormSchemaItem[]
  tableSchema?: TableSchemaItem[]
  filterSchema?: FilterSchemaItem[]
  form?: FormSchemaItem[]
  displayField?: string
  dataTableProps?: any
  [key: string]: any
}
