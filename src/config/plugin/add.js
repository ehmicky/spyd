import omit from 'omit.js'

import { normalizeReporters } from '../../report/config/main.js'

import { addPluginsConfig } from './config.js'
import { loadPlugins } from './load.js'
import { PLUGIN_TYPES_ARRAY } from './types/main.js'

// Several configuration properties (`runner`, `reporter`)
// can be customized with custom modules. This loads them. Each type can specify
// builtin modules too.
// Most plugin types need only a single plugin per benchmark, but they still
// allow several for some use cases. Since the most common case is a single
// plugin, selecting plugins:
//  - can be either a string or an array of strings
//  - uses a singular property name
export const addPlugins = async function (config, command) {
  const pluginsConfigs = await Promise.all(
    PLUGIN_TYPES_ARRAY.map((pluginTypeInfo) =>
      getPluginsByType(pluginTypeInfo, config),
    ),
  )
  const pluginsConfigA = Object.fromEntries(pluginsConfigs)
  const configA = removePluginProps(config)
  const configB = { ...configA, ...pluginsConfigA }
  const configC = normalizePluginsConfig(configB, command)
  return configC
}

const getPluginsByType = async function (
  {
    type,
    varName,
    selectProp,
    configProp,
    modulePrefix,
    builtins,
    topProps,
    isCombinationDimension,
    mainDefinitions,
  },
  config,
) {
  const ids = config[selectProp]

  if (ids === undefined) {
    return [varName, []]
  }

  const plugins = await loadPlugins({
    ids,
    type,
    modulePrefix,
    builtins,
    isCombinationDimension,
    mainDefinitions,
  })
  const pluginsA = addPluginsConfig({ plugins, config, configProp, topProps })
  return [varName, pluginsA]
}

// Remove plugin properties, so only the normalized ones are available
const removePluginProps = function (config) {
  const configProps = PLUGIN_TYPES_ARRAY.flatMap(getConfigProp)
  return omit.default(config, configProps)
}

const getConfigProp = function ({ selectProp, configProp }) {
  return [selectProp, configProp]
}

// Normalize plugins configuration
const normalizePluginsConfig = function (config, command) {
  return normalizeReporters(config, command)
}
