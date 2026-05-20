interface OldSchemaField {
  type: string;
  key: string;
  title: string;
  config: string;
  [key: string]: any;
}

interface FilterItem {
  key: string;
  boolLabel?: [string, string];
  [key: string]: any;
}

interface OldSchema {
  type: string;
  name?: string;
  title: string;
  key: string;
  properties: Record<string, OldSchemaField>;
  required?: string[];
  form?: string[];
  listFields?: string[];
  filters?: Record<string, (string | FilterItem)[]>;
}

interface NewSchemaField {
  type?: string;
  title?: string;
  key?: string;
  controlType?: string;
  [key: string]: any;
}

interface SchemaItem {
  key: string;
  [key: string]: any;
}

interface NewSchema {
  schema: {
    type: string;
    title: string;
    key: string;
    properties: Record<string, NewSchemaField>;
    required?: string[];
  };
  tableSchema: SchemaItem[];
  formSchema: SchemaItem[];
  filterSchema: SchemaItem[];
}

// config 到 controlType 的基础映射
const configToControlType: Record<string, string> = {
  '文本': 'text',
  '数字': 'number',
  '选择器': 'select',
  '时间': 'date',
  '日期范围': 'date-range',
  '时间2': 'time',
  '富文本': 'rich-text',
  '布尔值': 'boolean',
  '查找引用': 'reference',
  '表格': 'editable-table',
  '附件': 'upload',
  '附件组': 'upload',
  '区域': 'area',
  '星级评价': 'rate',
  '定位': 'map',
  '链接': 'link',
  '公式': 'formula',
  '编号': 'serial-number',
  '用户': 'user-role',
  '字节数组': 'bytes-array',
  '关联字段': 'relate-plus',
};

// 基础 schema 需要保留的属性
const baseSchemaProps = new Set<string>([
  'type', 'title', 'minLength', 'maxLength',
  'textContent', 'languageType', 'defaultVal', 'description', 'unique',
  'jsLogic', 'need', 'dbType', 'bitNum', 'decimal', 'min', 'max', 'unit', 'enum',
  'enumNames', // enum_title 转换后
  'metricStore', 'properties', 'items',
  'relate', 'showField', 'relateShowFields', 'insideFilter',
  'searchRelate', 'searchCondition', 'computeMethod', 'sort', 'numberLimit', 'numberFormat',
  'maxCount', 'minCount',
  'styleType', 'accept', 'uploadPosition', 'mediaDelete', 'autoZip', 'size', 'folderType', 'folder', 'watermark', 'base64', 'autoName', 'addToken',
  'maxUploadNum', 'pattern', 'serialRules', 'relateTo', 'userType',
  'controlType', // 新增
]);

// tableSchema 需要保留的属性
const tableSchemaProps = new Set<string>([
  'listFields', 'canOrder', 'tableFixed', 'NullShow', 'recordDetail',
  'previewSize', 'listShow', 'showNum', 'lngLat', 'positionName',
]);

// formSchema 需要保留的属性
const formSchemaProps = new Set<string>([
  'afterNow', 'timeFormat', 'allowSelectOld', 'allowAdd',
  'highTableFields', 'btnText', 'displayForm', 'cardLayout', 'showPagination', 'uniqueRow',
  'uniqueFields', 'fieldRules', 'createAddBtn', 'editAddBtn', 'createDelBtn', 'editDelBtn',
  'onlyCamera', 'canDownload', 'areaType', 'count', 'showType', 'canEdit',
  'linkType', 'placeholder', 'checkedChildren', 'unCheckedChildren', 'manualChange',
  'selectType', 'selectFace', 'treeMark', 'recordSelectType',
  'dateFormat', 'dateType', 'format', 'filedFormat', 'filterMode',
  'width', 'height', 'sort', 'widthInForm',
]);

// filterSchema 需要保留的属性
const filterSchemaProps = new Set<string>([
  'filterFields',
  'filterFormat',
  'format'
]);

/**
 * 主转换函数
 * @param oldSchema - 旧版本的 schema 对象
 * @returns 新格式的 schema 对象
 */
function transformSchema(oldSchema: OldSchema): NewSchema {
  const result: NewSchema = {
    schema: {
      type: 'object',
      title: oldSchema?.title || oldSchema.title || '',
      key: oldSchema?.key || oldSchema.key || '',
      properties: {},
    },
    tableSchema: [],
    formSchema: [],
    filterSchema: [],
  };

  // 保存原 schema 的 required
  if (oldSchema?.required) {
    result.schema.required = oldSchema.required;
  }

  // 获取字段顺序配置
  const formOrder = oldSchema?.form || [];
  const listFieldsOrder = oldSchema?.listFields || [];

  // 遍历所有属性进行转换
  Object.entries(oldSchema?.properties || {}).forEach(([key, fieldValue]) => {
    const baseField: NewSchemaField = {};
    const tableField: SchemaItem = { key };
    const formField: SchemaItem = { key };
    const filterField: SchemaItem = { key };

    // 处理 controlType 转换
    let controlType = configToControlType[fieldValue.config];

    // 特殊规则: 文本
    if (fieldValue.config === '文本') {
      if (fieldValue.textType === 'input') {
        controlType = 'text';
      } else if (fieldValue.textType === 'textArea') {
        controlType = 'text-area';
      }
    }

    // 特殊规则: 选择器
    if (fieldValue.config === '选择器') {
      if (fieldValue.type === 'number') {
        controlType = 'select-number';
      } else if (fieldValue.type === 'string') {
        controlType = 'select-string';
      } else if (fieldValue.type === 'array') {
        if (fieldValue.items?.type === 'number') {
          controlType = 'select-array-number';
        } else if (fieldValue.items?.type === 'string') {
          controlType = 'select-array-string';
        }
      }
    }

    // 特殊规则: 关联字段
    if (fieldValue.config === '关联字段') {
      if (fieldValue.type === 'object') {
        controlType = 'relate';
      } else if (fieldValue.type === 'array') {
        controlType = 'relate-multiple';
      }
    }

    // 遍历字段的所有属性进行分类
    Object.entries(fieldValue).forEach(([propKey, propValue]) => {
      // 属性重命名映射
      const renamedKey: string = {
        'enum_title1': 'enumNames',
        'enum_title': 'enumNames',
        'enum1': 'enum',
        'tableFields': 'items',
      }[propKey] || propKey;

      // 跳过 config，已经转换为 controlType
      if (propKey === 'config') return;
      // 分配到对应的 schema
      if (baseSchemaProps.has(renamedKey)) {
        if (renamedKey == 'items') {
          const { schema, formSchema } = transformSchema(propValue)
          baseField[renamedKey] = { ...schema, formSchema }
        } else {
          baseField[renamedKey] = propValue;
        }
      } else if (tableSchemaProps.has(propKey)) {
        tableField[propKey] = propValue;
      } else if (formSchemaProps.has(propKey)) {
        formField[propKey] = propValue;
      } else if (filterSchemaProps.has(propKey)) {
        filterField[propKey] = propValue;
      }
    });

    // 设置 controlType
    if (controlType) {
      baseField.controlType = controlType;
    }

    // 保留 type, title, key
    baseField.type = fieldValue.type;
    baseField.title = fieldValue.title;
    baseField.key = fieldValue.key;

    // 添加到 schema.properties
    result.schema.properties[key] = baseField;

    // 如果字段在 form 中，添加到 formSchema
    if (formOrder.includes(key)) {
      // 只保留非空属性
      const cleanFormField = Object.fromEntries(
        Object.entries(formField).filter(([_, v]) => v !== undefined && v !== null)
      ) as SchemaItem;
      if (Object.keys(cleanFormField).length >= 1) {
        result.formSchema.push(cleanFormField);
      }
    }

    // 如果字段在 listFields 中，添加到 tableSchema
    if (listFieldsOrder.includes(key)) {
      // 只保留非空属性
      const cleanTableField = Object.fromEntries(
        Object.entries(tableField).filter(([_, v]) => v !== undefined && v !== null)
      ) as SchemaItem;
      if (Object.keys(cleanTableField).length >= 1) {
        result.tableSchema.push(cleanTableField);
      }
    }

    // 如果 filterFields 为 true，添加到 filterSchema
    if (fieldValue.filterFields === true) {
      // 移除 filterFields 和 key 属性（它们是标志位）
      const { filterFields, ...cleanFilterField } = filterField as any;
      // 只保留非空属性
      const finalFilterField = Object.fromEntries(
        Object.entries(cleanFilterField).filter(([_, v]) => v !== undefined && v !== null)
      ) as SchemaItem;
      result.filterSchema.push(finalFilterField);
    }
  });

  // 按 form 和 listFields 的顺序排序
  result.formSchema.sort((a, b) => formOrder.indexOf(a.fieldKey) - formOrder.indexOf(b.fieldKey));
  result.tableSchema.sort((a, b) => listFieldsOrder.indexOf(a.fieldKey) - listFieldsOrder.indexOf(b.fieldKey));

  // 处理 filters 字段
  if (oldSchema?.filters) {
    Object.entries(oldSchema.filters).forEach(([filterGroup, filterItems]) => {
      filterItems.forEach((item) => {
        let filterItemKey: string;

        if (typeof item === 'string') {
          // 简单字符串格式
          filterItemKey = item;
        } else {
          // 对象格式，如 { key: "disable", boolLabel: ["禁用", "启用"] }
          filterItemKey = item.key;
        }

        // 从 properties 中查找对应字段的 filterSchemaProps 属性
        const property = oldSchema.properties?.[filterItemKey];
        const filterItem: SchemaItem = { key: filterItemKey };

        // 如果是对象格式，先复制对象中的额外属性（如 boolLabel）
        if (typeof item !== 'string') {
          Object.entries(item).forEach(([k, v]) => {
            if (k !== 'key') {
              filterItem[k] = v;
            }
          });
        }

        // 从 properties 中复制 filterSchemaProps 中定义的属性
        if (property) {
          filterSchemaProps.forEach((prop) => {
            if (property[prop] !== undefined && property[prop] !== null) {
              filterItem[prop] = property[prop];
            }
          });
        }

        result.filterSchema.push(filterItem);
      });
    });
  }  
  
  return result;
}

export default transformSchema;
