import { getSharedConfig } from './shared.js'

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
  const { sharedConfig: sharedConfigA, sharedPropNames } = getSharedConfig(
    sharedConfig,
    item,
  )
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
    sharedConfig: sharedConfigA,
    sharedPropNames,
    context,
    cwd,
  }
}
