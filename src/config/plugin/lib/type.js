// Add default values and normalize plugin types
export const normalizePluginType = function ({
  name = 'plugins',
  modulePrefix,
  pluginProp = 'plugin',
  multiple = false,
  duplicates = false,
  builtins = {},
  default: defaultValue = [],
  shape = [],
  list = {},
  item = [],
  sharedConfig = {},
  context,
  cwd,
}) {
  return {
    name,
    modulePrefix,
    pluginProp,
    multiple,
    duplicates,
    builtins,
    default: defaultValue,
    shape,
    list,
    item,
    sharedConfig,
    context,
    cwd,
  }
}
