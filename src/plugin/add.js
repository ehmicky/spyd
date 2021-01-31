import filterObj from 'filter-obj'

import { addPluginsConfig } from './config.js'
import { loadPlugins } from './load.js'
import { PLUGIN_TYPES, PLUGIN_PROP_PREFIXES } from './types.js'
import { validatePlugins } from './validate.js'

// Several configuration properties (`runner`, `reporter`, `store`)
// can be customized with custom modules. This loads them. Each type can specify
// builtin modules too.
// Most plugin types need only a single plugin per benchmark, but they still
// allow several for some use cases. Since the most common case is a single
// plugin, selecting plugins:
//  - can be either a string or an array of strings
//  - uses a singular property name
export const addPlugins = async function (config) {
  const pluginsConfigs = await Promise.all(
    PLUGIN_TYPES.map(
      ({
        type,
        varName,
        property,
        configPrefix,
        modulePrefix,
        builtins,
        configProps,
      }) =>
        getPluginsByType({
          config,
          type,
          varName,
          property,
          configPrefix,
          modulePrefix,
          builtins,
          configProps,
        }),
    ),
  )
  const pluginsConfigA = Object.fromEntries(pluginsConfigs)
  const configA = removePluginProps(config)
  return { ...configA, ...pluginsConfigA }
}

const getPluginsByType = async function ({
  config,
  type,
  varName,
  property,
  configPrefix,
  modulePrefix,
  builtins,
  configProps,
}) {
  const ids = config[property]
  const plugins = await loadPlugins({ ids, type, modulePrefix, builtins })
  const pluginsA = addPluginsConfig({
    plugins,
    config,
    configPrefix,
    configProps,
  })
  validatePlugins(pluginsA, type)
  return [varName, pluginsA]
}

// Remove plugin properties, so only the normalized ones are available
const removePluginProps = function (config) {
  return filterObj(config, isNotPluginProp)
}

const isNotPluginProp = function (key) {
  return !PLUGIN_PROP_PREFIXES.some((propPrefix) => key.startsWith(propPrefix))
}
