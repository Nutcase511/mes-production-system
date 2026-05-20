import _ from 'lodash'

// 将schema.properties转换成数组形式
const convertProps = (properties: any, form?: any) => {
  let ops: any[] = []
  let list: string[] = []
  // 和表单显示顺序统一
  if (form && !(form.length == 1 && form[0] == '*')) {
    list = form.includes('*')
      ? _.uniq([...(form.filter((item: any) => item !== '*').map((item: any) => item.key ?? item) || []), ..._.keys(properties)])
      : form.map((item: any) => item.key ?? item)
  } else {
    list = _.keys(properties)
  }
  const parseProps = (propertKeys: string[], properties: any, prefix?: any) => propertKeys.map(item => {
    const prev = properties[item] || {}
    if (prev.userType || prev.fieldType == 'user') {
      prev.relateTo = 'User'
    }
    if (prev.relateTo || prev.relate) {
      prev.properties = {}
    }
    const title = prev.title
      ? prefix && prefix.title
        ? prefix.title + '-' + prev.title
        : prev.title
      : null
    // 过滤无名称属性
    title && ops.push({
      ...prev,
      title,
      key: prefix && prefix.key ? prefix.key + '.' + item : item,
    })
  })
  parseProps(list, properties)
  return ops
}

export { convertProps }
