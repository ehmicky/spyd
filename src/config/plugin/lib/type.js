// Add default values and normalize plugin types
export const normalizePluginType = function ({
  name = 'plugins',
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
    list: { ...list, default: listDefault },
    item,
  }
}
