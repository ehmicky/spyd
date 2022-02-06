// Add default values of plugin types
export const addPluginTypeDefault = function ({
  name,
  multiple = false,
  shape = [],
  builtins = {},
  selectProp: {
    name: selectPropName = name,
    default: selectPropDefault = [],
    ...selectProp
  } = {},
  configProp: {
    name: configPropName = `${name}Config`,
    default: configPropDefault = {},
    ...configProp
  } = {},
  sharedProps = [],
  ...pluginType
}) {
  return {
    ...pluginType,
    name,
    multiple,
    shape,
    builtins,
    selectProp: {
      ...selectProp,
      name: selectPropName,
      default: selectPropDefault,
    },
    configProp: {
      ...configProp,
      name: configPropName,
      default: configPropDefault,
    },
    sharedProps,
  }
}
