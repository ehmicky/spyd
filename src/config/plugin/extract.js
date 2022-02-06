import { list } from '../normalize/lib/prop_path/get.js'
import { isParent } from '../normalize/lib/prop_path/parse.js'
import { set, remove } from '../normalize/lib/prop_path/set.js'

import { PLUGIN_TYPES_ARRAY } from './types.js'

// Retrieve all plugin types, normalized
export const getPluginTypes = function () {
  return PLUGIN_TYPES_ARRAY.map(addSharedConfigPropNames)
}

// Retrieve all unique `name` of shared config properties, excluding their
// children
const addSharedConfigPropNames = function (pluginType) {
  const sharedConfigPropNames = pluginType.sharedConfig.map(getDefinitionName)
  const sharedConfigPropNamesA = [...new Set(sharedConfigPropNames)].filter(
    hasNoParent,
  )
  return { ...pluginType, sharedConfigPropNames: sharedConfigPropNamesA }
}

const getDefinitionName = function ({ name }) {
  return name
}

const hasNoParent = function (nameA, indexA, names) {
  return names.every(
    (nameB, indexB) => indexB === indexA || !isParent(nameB, nameA),
  )
}

// Retrieve top-level properties that are shared with all plugins of a specific
// type. Those are merged with plugin-specific properties.
export const getTopConfig = function (config, { sharedConfigPropNames }) {
  const topConfigProps = sharedConfigPropNames.flatMap((sharedConfigPropName) =>
    Object.entries(list(config, sharedConfigPropName)),
  )
  return topConfigProps.reduce(addTopConfigProp, {})
}

const addTopConfigProp = function (topConfig, [path, value]) {
  return set(topConfig, path, value)
}

// Remove all plugin-related properties
export const removePluginsProps = function (config, pluginTypes) {
  const pluginProps = pluginTypes.flatMap(getPluginProps)
  return pluginProps.reduce(removePluginProp, config)
}

const getPluginProps = function ({
  selectProp: { name: selectName },
  configProp,
  sharedConfigPropNames,
}) {
  return [selectName, configProp, ...sharedConfigPropNames]
}

const removePluginProp = function (config, name) {
  return remove(config, name)
}
