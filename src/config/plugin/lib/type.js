// Add default values and normalize plugin types
export const normalizePluginType = function ({
  name = 'plugins',
  modulePrefix,
  pluginProp = 'plugin',
  duplicates = false,
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
    duplicates,
    builtins,
    default: defaultValue,
    shape,
    list,
    item,
  }
}
