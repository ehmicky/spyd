// Add default values and normalize plugin types
export const normalizePluginType = function ({
  name = 'plugins',
  modulePrefix,
  pluginProp = 'id',
  multiple = false,
  builtins = {},
  default: defaultValue = [],
  shape = [],
  list = {},
  item = [],
}) {
  return {
    name,
    modulePrefix,
    pluginProp,
    multiple,
    builtins,
    default: defaultValue,
    shape,
    list,
    item,
  }
}
