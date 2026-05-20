import _ from 'lodash'

const checkTime = (field: any = {}) => {
  if (['date', 'datetime', 'date-time'].indexOf(field.format) > -1 || field.fieldType == 'datePicker') {
    return true
  }
  return false
}

const formatFilter = (item: any, schema: any, prefix = ''): Record<string, any> => {
  // 验证item.field是否有效
  if (!item.field || typeof item.field !== 'string') {
    return item.value || {}
  }

  // 如果field是操作符，直接返回原始键值对
  if (item.field.startsWith('$')) {
    return { [item.field]: item.value }
  }

  // 处理关联字段的子字段查询
  if (item.field && item.field.includes('.')) {
    const [parentKey, childKey] = item.field.split('.')
    const parentField = schema?.properties?.[parentKey]

    // 确认父字段是关联字段
    if (parentField && parentField.config === "关联字段" && parentField.relate) {
      const relatedTableId = parentField.relate.id || parentField.relate.tt
      if (relatedTableId) {

        // 构建完整的关联查询，直接返回最终结构，与原代码保持一致
        return {
          [parentKey]: {
            "$in": {
              "$relate": {
                "_table": relatedTableId,
                "filter": formatFilter({ ...item, field: childKey }, schema, prefix),
              }
            }
          }
        }
      }
    }
  }

  let value = _.isPlainObject(item.value) && _.isEmpty(item.value)
    ? null
    : _.isPlainObject(item.value)
      ? _.omit(item.value, ['icon', 'child'])
      : item.value

  const baseProperties = schema?.properties
  let k = item.field
  if (k && k.indexOf('.') >= 0) { k = k.replace('.', '.properties.') }
  const p = _.get(baseProperties, k) || {}
  const type = p && p.type
  let result

  // 处理特殊情况和条件组合
  const isNullOrNotNullSpecialCase = ['isNull', 'notNull'].indexOf(item.method) > -1 &&
    item.field &&
    (['array', 'object', 'string'].indexOf(p.type) > -1 || !p.type) &&
    !checkTime(p)

  const hasRegexValue = value?.['$regex'] || value?.like
  const isFlowBind = (v: string) => (v.startsWith('{{') && v.endsWith('}}')) || (v.startsWith('{#') && v.endsWith('#}'))

  // 使用switch处理method
  switch (item.method) {
    // 数组操作
    case 'arrayIn': {
      if (value && _.isArray(value)) {
        result = { [`${prefix}$or`]: value.map((v: any) => ({ [item.field]: { [`${prefix}$regex`]: v?.id || v } })) }
      } else if (value && _.isString(value) && isFlowBind(value)) { // 流程绑定的模版字符串
        result = { [`${prefix}$in`]: value }
      } else if (value && typeof value === 'string') {
        // 当value为字符串时，等同于contains操作
        result = { [`${prefix}$regex`]: value }
      } else if (value && _.isPlainObject(value)) {
        result = value.id
      }
      break
    }

    case 'arrayInAll': { // 新增：同时包含所有元素
      if (value && _.isArray(value)) {
        result = { [`${prefix}$and`]: value.map((v: any) => ({ [item.field]: { [`${prefix}$regex`]: v?.id || v } })) }
      }
      break
    }

    case 'arrayNin': {
      if (value && _.isArray(value)) {
        result = { [`${prefix}$and`]: value.map((v: any) => ({ [item.field]: { [`${prefix}$not`]: { [`${prefix}$regex`]: v?.id || v } } })) }
      } else if (value && _.isString(value) && isFlowBind(value)) { // 流程绑定的模版字符串
        result = { [`${prefix}$nin`]: value }
      } else if (value && typeof value === 'string') {
        // 当value为字符串时，等同于notContains操作
        result = { [`${prefix}$not`]: { [`${prefix}$regex`]: value } }
      } else if (value && _.isPlainObject(value)) {
        result = { [`${prefix}$ne`]: value.id }
      }
      break
    }

    // 空值检查
    case 'isNull': {
      if (isNullOrNotNullSpecialCase) {
        result = { [`${prefix}$or`]: [null, '', '{}', '[]'].map((v: any) => ({ [item.field]: v })) }
      } else {
        result = null
      }
      break
    }

    case 'notNull': {
      if (isNullOrNotNullSpecialCase) {
        result = { [`${prefix}$and`]: [null, '', '{}', '[]'].map((v: any) => ({ [item.field]: { [`${prefix}$ne`]: v } })) }
      } else {
        result = { [`${prefix}$ne`]: null }
      }
      break
    }

    // 比较操作
    case 'eq': {
      if (hasRegexValue) {
        result = { [`${prefix}$regex`]: value?.['$regex'] || value?.like }
      } else {
        result = value
      }
      break
    }

    case 'ne': {
      if (hasRegexValue) {
        result = { [`${prefix}$not`]: { [`${prefix}$regex`]: value?.['$regex'] || value?.like } }
      } else {
        const neValue = value?.in || value?.['$in'] || value
        // 特殊处理ne方法，允许匹配null
        if (_.isArray(neValue)) {
          result = { [`${prefix}$nin`]: neValue }
        } else {
          result = { [`${prefix}$ne`]: neValue }
        }
      }
      break
    }

    case 'gt':
    case 'lt':
    case 'gte':
    case 'lte': {
      result = { [prefix + '$' + item.method]: value?.id || value }
      break
    }

    // 文本搜索
    case 'contains': {
      result = { [`${prefix}$regex`]: value }
      break
    }

    case 'notContains': {
      result = { [`${prefix}$not`]: { [`${prefix}$regex`]: value } }
      break
    }

    case 'startsWith': {
      if (value && _.isArray(value)) {
        // 处理数组情况 - 任意一个前缀匹配即可
        result = { [`${prefix}$or`]: value.map((v: any) => ({ [item.field]: { [`${prefix}$regex`]: '^' + (v || '') } })) }
      } else {
        // 处理单个值
        result = { [`${prefix}$regex`]: '^' + (value || '') }
      }
      break
    }

    case 'endsWith': {
      if (value && _.isArray(value)) {
        // 处理数组情况 - 任意一个后缀匹配即可
        result = { [`${prefix}$or`]: value.map((v: any) => ({ [item.field]: { [`${prefix}$regex`]: (v || '') + '$' } })) }
      } else {
        // 处理单个值
        result = { [`${prefix}$regex`]: (value || '') + '$' }
      }
      break
    }

    case 'notStartsWith': {
      if (value && _.isArray(value)) {
        // 处理数组情况 - 不匹配任何一个前缀
        result = { [`${prefix}$and`]: value.map((v: any) => ({
          [item.field]: { [`${prefix}$not`]: { [`${prefix}$regex`]: '^' + (v || '') } }
        })) }
      } else {
        // 处理单个值
        result = { [`${prefix}$not`]: { [`${prefix}$regex`]: '^' + (value || '') } }
      }
      break
    }

    case 'notEndsWith': {
      if (value && _.isArray(value)) {
        // 处理数组情况 - 不匹配任何一个后缀
        result = { [`${prefix}$and`]: value.map((v: any) => ({
          [item.field]: { [`${prefix}$not`]: { [`${prefix}$regex`]: (v || '') + '$' } }
        })) }
      } else {
        // 处理单个值
        result = { [`${prefix}$not`]: { [`${prefix}$regex`]: (value || '') + '$' }
        }
      }
      break
    }

    case 'like': {
      result = { [`${prefix}$regex`]: value }
      break
    }

    case 'notLike': {
      result = { [`${prefix}$not`]: { [`${prefix}$regex`]: value } }
      break
    }

    // 集合操作
    case 'in': {
      const inValue = value?.in || value?.['$in'] || value
      result = _.isArray(inValue) ? { [`${prefix}$in`]: inValue?.map((item: any) => item?.id || item) } : inValue
      break
    }

    case 'nin': {
      const ninValue = value?.in || value?.['$in'] || value
      result = _.isArray(ninValue) ? { [`${prefix}$nin`]: ninValue?.map((item: any) => item?.id || item) } : { [`${prefix}$ne`]: ninValue }
      break
    }

    // 范围操作
    case 'range': {
      if (_.isObject(value)) {
        const rangeValue = value as { gte?: any; lte?: any }
        result = { [`${prefix}$gte`]: rangeValue.gte, [`${prefix}$lte`]: rangeValue.lte }
      } else {
        result = value
      }
      break
    }

    case 'notRange': {
      if (_.isObject(value)) {
        const rangeValue = value as { gte?: any; lte?: any }
        result = { [`${prefix}$not`]: { [`${prefix}$gte`]: rangeValue.gte, [`${prefix}$lte`]: rangeValue.lte } }
      } else {
        result = { [`${prefix}$not`]: value }
      }
      break
    }

    // 新增：下级包含查询 - 处理层级结构的字符串
    case 'subin': {
      const subinValue = value?.in || value?.['$in'] || value
      if (subinValue && typeof subinValue === 'string') {
        // 将斜杠分隔的字符串拆分为所有可能的前缀
        const parts = subinValue.split('/')
        const prefixes: string[] = []
        let currentPath = ''

        // 构建所有可能的前缀路径
        for (let i = 0; i < parts.length; i++) {
          currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i]
          prefixes.push(currentPath)
        }

        // 使用 $in 操作符
        result = { [`${prefix}$in`]: prefixes }
      } else if (subinValue && _.isArray(subinValue)) {
        // 处理数组中的每个层级路径字符串
        const allPrefixes: any[] = []

        // 遍历数组中的每个路径
        subinValue.forEach((path: any) => {
          if (typeof path === 'string') {
            const parts = path.split('/')
            let currentPath = ''

            // 为每个路径生成所有可能的前缀
            for (let i = 0; i < parts.length; i++) {
              currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i]
              allPrefixes.push(currentPath)
            }
          } else {
            // 如果不是字符串，直接添加
            allPrefixes.push(path)
          }
        })
        // 使用 $in 操作符查询是否包含任一前缀
        result = { [`${prefix}$in`]: _.uniq(allPrefixes) }
      }
      break
    }

    // 新增：下级不包含查询 - 与 subin 相反的逻辑
    case 'subNotIn': {
      const subNotInValue = value?.in || value?.['$in'] || value
      if (subNotInValue && typeof subNotInValue === 'string') {
        // 将斜杠分隔的字符串拆分为所有可能的前缀
        const parts = subNotInValue.split('/')
        const prefixes: string[] = []
        let currentPath = ''

        // 构建所有可能的前缀路径
        for (let i = 0; i < parts.length; i++) {
          currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i]
          prefixes.push(currentPath)
        }

        // 使用 $nin 操作符（不包含任何一个前缀）
        result = { [`${prefix}$nin`]: prefixes }
      } else if (subNotInValue && _.isArray(subNotInValue)) {
        // 处理数组中的每个层级路径字符串
        const allPrefixes: any[] = []

        // 遍历数组中的每个路径
        subNotInValue.forEach((path: any) => {
          if (typeof path === 'string') {
            const parts = path.split('/')
            let currentPath = ''

            // 为每个路径生成所有可能的前缀
            for (let i = 0; i < parts.length; i++) {
              currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i]
              allPrefixes.push(currentPath)
            }
          } else {
            // 如果不是字符串，直接添加
            allPrefixes.push(path)
          }
        })

        // 使用 $nin 操作符查询不包含任一前缀
        result = { [`${prefix}$nin`]: _.uniq(allPrefixes) }
      }
      break
    }

    // 新增：属于查询 - 检查字段值是否属于指定的区域层级结构
    case 'belongsTo': {
      const belongsToValue = value?.in || value?.['$in'] || value
      if (belongsToValue && typeof belongsToValue === 'string') {
        // 对于单个区域路径，使用正则表达式匹配以该路径开头的所有下级
        result = { [`${prefix}$regex`]: `^${belongsToValue}` }
      } else if (belongsToValue && _.isArray(belongsToValue)) {
        // 对于多个区域路径，使用 $or 操作符
        result = {
          [`${prefix}$or`]: belongsToValue.map((path: any) =>
            ({ [item.field]: { [`${prefix}$regex`]: `^${path}` } })
          )
        }
      }
      break
    }

    // 新增：不属于查询 - 检查字段值是否不属于指定的区域层级结构
    case 'notBelongsTo': {
      const notBelongsToValue = value?.in || value?.['$in'] || value
      if (notBelongsToValue && typeof notBelongsToValue === 'string') {
        // 对于单个区域路径，使用 $not 和 $regex 否定匹配
        result = { [`${prefix}$not`]: { [`${prefix}$regex`]: `^${notBelongsToValue}` } }
      } else if (notBelongsToValue && _.isArray(notBelongsToValue)) {
        // 对于多个区域路径，使用 $and 操作符（不属于任何一个）
        result = {
          [`${prefix}$and`]: notBelongsToValue.map((path: any) =>
            ({ [item.field]: { [`${prefix}$not`]: { [`${prefix}$regex`]: `^${path}` } } })
          )
        }
      }
      break
    }

    // 默认处理
    default:
      result = value
  }

  // 确定结果类型
  let resultType: string
  if (type === 'array' && _.isArray(result)) {
    resultType = 'arrayWithArrayResult'
  } else if (type === 'array' && (p.relate || p.relateTo) && _.isPlainObject(result) && (result[`${prefix}$regex`] || _.get(result, `${prefix}$not.${prefix}$regex`))) {
    resultType = 'arrayWithRegexResult'
  } else if (type === 'array' && p.items?.properties?.id && _.isPlainObject(result) && (result[`${prefix}$regex`] || _.get(result, `${prefix}$not.${prefix}$regex`))) {
    resultType = 'arrayWithObjectResult'
  } else if (type === 'object') {
    resultType = 'objectResult'
  } else if (_.isArray(result)) {
    resultType = 'generalArrayResult'
  } else if (result && (result[`${prefix}$or`] || result[`${prefix}$and`])) {
    resultType = 'logicalOperatorResult'
  } else {
    resultType = 'defaultResult'
  }

  // 特殊处理部门查询
  if (p.related == 'department' && item.value?.table?.id) {
    return { [item.value.table.id + 'Id']: result }
  }
  // 使用switch处理不同类型的结果
  switch (resultType) {
    case 'arrayWithArrayResult':
      return { [item.field + 'Id']: { [`${prefix}$in`]: result.map((j: any) => j?.id) } }

    case 'arrayWithRegexResult':
      return { [item.field + 'Id']: result }

    case 'arrayWithObjectResult':
      return { [item.field + 'Id']: { [`${prefix}$in`]: [result?.[`${prefix}$regex`]] } }

    case 'objectResult':
      // result为null 或 { $not: null } 是为空、不为空过滤 字段后面不拼Id
      if (_.isNull(result) || result == '' || result == '{}' || result == '[]') {
        return { [item.field]: result }
      } else if (_.has(result, `${prefix}$ne`) && (_.isNull(result?.[`${prefix}$ne`]) || result?.[`${prefix}$ne`] == '' || result?.[`${prefix}$ne`] == '{}' || result?.[`${prefix}$ne`] == '[]')) {
        return { [item.field]: { [`${prefix}$ne`]: result?.[`${prefix}$ne`] } }
      } else {
        return { [item.field + 'Id']: result?.id || result }
      }

    case 'generalArrayResult':
      return { [p?.config === '关联字段' ? item.field + 'Id' : item.field]: { in: result.map((j: any) => j.id || j) } }

    case 'logicalOperatorResult':
      return result

    case 'defaultResult':
    default:
      return { [item.field == 'uid' ? 'id' : item.field]: result }
  }
}

export const formatFilters = (array: any[], schema: any, prefix = '') => {
  if (!array || array.length === 0) return null

  // 使用扩展的formatFilter函数简化处理
  const result = array
    .filter((item: any) => _.isNil(item.valid) || item.valid)
    .map((item: any) => {
      // 获取过滤条件 - 现在直接返回 { field: value } 结构
      try {
        return formatFilter(item, schema, prefix)
      } catch (e) {
        return null
      }
    })
    .filter(Boolean) // 过滤掉无效结果

  // 递归处理嵌套条件
  const processNestedConditions = (condition: any) => {
    // 确保condition是有效的对象类型
    if (!condition || typeof condition !== 'object') {
      return {}
    }
    try {
      return Object.keys(condition).reduce((acc: any, key: string) => {
        const value = condition[key]

        if (key === `${prefix}$or` || key === `${prefix}$and`) {
          // 确保value是数组且不为空
          if (!Array.isArray(value) || value.length === 0) {
            acc[key] = []
            return acc
          }
          // 处理嵌套条件
          acc[key] = value
            .filter((f: any) => f && typeof f === 'object') // 确保每个元素是有效对象
            .map((f: any) => {
              if (Object.keys(f).length === 1) {
                const innerField = Object.keys(f)[0]

                // 检查innerField是否是操作符，如果是则不进行递归处理
                if (innerField.startsWith('$')) {
                  return f
                }

                const innerValue = f[innerField]
                try {
                  const innerResult = formatFilter({ field: innerField, method: 'eq', value: innerValue }, schema, prefix)
                  return innerResult || f
                } catch (e) {
                  return f
                }
              }
              return f
            })
            .filter(Boolean) // 过滤掉无效结果
        } else {
          acc[key] = value
        }

        return acc
      }, {})
    } catch (e) {
      return {}
    }
  }

  // 过滤无效结果，确保每个结果都是有效对象
  const processedResult = result
    .filter((item: any) => item && typeof item === 'object')
    .map(processNestedConditions)

  return processedResult.length > 1 ? { [`${prefix}$and`]: processedResult } : processedResult?.[0]
}

/**
 * 获取查询过滤器（blocks 级别的通用方法）
 */
export const getQueryFilter = (filters: any[], schema: any, prefix = '') => {
  if (!filters || !Array.isArray(filters) || filters.length === 0) {
      return null
    }
  
    try {
      // 直接使用整合后的formatFilters函数，增加错误处理
      const filter = _.compact(filters.map((f: any) => {
        try {
          return formatFilters(f, schema, prefix)
        } catch (e) {
          return null
        }
      }))
  
      const result = _.isEmpty(filter) ? null : filter.length == 1 ? filter[0] : { [`${prefix}$or`]: filter }
      return result
    } catch (e) {
      return null
    }
}

function filterEmptyValues(arr: any[]) {
  return arr.filter((item: any) => {
    if (Array.isArray(item)) {
      // 递归过滤数组
      const filteredArray: any[] = filterEmptyValues(item)
      return filteredArray.length > 0
    } else if (typeof item === 'object' && item !== null) {
      // 过滤空对象
      return Object.keys(item).length > 0
    } else {
      // 过滤空值
      return item !== null && item !== undefined && item !== ''
    }
  })
}

export const getOtherCondition = (otherCondition: any[]) => {
  otherCondition = filterEmptyValues(otherCondition || [])
  const getConditon = ({ field, method, value }: any) => {
    if (method === 'range') {
      return `"${field}" >= ${value?.gte} and "${field}" <= ${value?.lte}`
    } else if (method === 'notRange') {
      return `"${field}" < ${value?.gte} or "${field}" > ${value?.lte}`
    } else {
      const opt: any = {
        'eq': '=',
        'ne': '!=',
        'gt': '>',
        'lt': '<',
        'gte': '>=',
        'lte': '<=',
      }
      return `"${field}" ${opt[method]} ${value}`
    }
  }
  return otherCondition?.length ? [`${otherCondition.map((arr: any) =>
    `(${arr.filter((item: any) => _.isNil(item.valid) || item.valid).map((item: any) => `(${getConditon(item)})`).join(' AND ')})`
  ).join(' OR ')}`] : null
}
