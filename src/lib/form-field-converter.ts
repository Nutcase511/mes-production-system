export const formFieldConverter = (schema: Record<string, any>) => {
  const converted: Record<string, any> = { schema }
  // enum → options 转换（仅当 schema 没有 options 时）  
  if (schema?.enum && !schema?.options) {
    converted.options = schema.enum.map((val: any, index: number) => ({
      value: val,
      label: schema.enumNames?.[index] ?? schema.enum_title?.[index] ?? val,
    }))
  }
  return { ...converted, ...schema }
}