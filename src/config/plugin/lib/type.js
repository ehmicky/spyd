// Add default values and normalize plugin types
export const normalizePluginType = function ({
  name,
  modulePrefix,
  pluginProp = 'id',
  multiple = false,
  builtins = {},
  shape = [],
  list: { default: listDefault = [], ...list } = {},
  item = [],
}) {
  return {
    name,
    modulePrefix,
    pluginProp,
    multiple,
    builtins,
    shape,
    list: { ...list, name, default: listDefault },
    item,
  }
}
