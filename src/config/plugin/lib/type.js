// Add default values and normalize plugin types
export const normalizePluginType = function ({
  name,
  modulePrefix,
  multiple = false,
  builtins = {},
  shape = [],
  list: { default: listDefault = [], ...list } = {},
  item = [],
}) {
  return {
    name,
    modulePrefix,
    multiple,
    builtins,
    shape,
    list: { ...list, name, default: listDefault },
    item,
  }
}
