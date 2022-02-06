import { normalizeReporters } from '../../report/config/main.js'

import { getPluginTypes, getTopConfig, removePluginsProps } from './extract.js'
import { loadPlugins } from './load.js'

// Several configuration properties (`runner`, `reporter`)
// can be customized with custom modules. This loads them. Each type can specify
// builtin modules too.
// Most plugin types need only a single plugin per benchmark, but they still
// allow several for some use cases. Since the most common case is a single
// plugin, selecting plugins:
//  - can be either a string or an array of strings
//  - uses a singular property name
export const addPlugins = async function (config, command, context) {
  const pluginTypes = getPluginTypes()
  const configA = await addPluginsProps(config, pluginTypes, context)
  const configB = removePluginsProps(configA, pluginTypes)
  const configC = normalizeReporters(configB, command)
  return configC
}

const addPluginsProps = async function (config, pluginTypes, context) {
  const pluginsConfigs = await Promise.all(
    pluginTypes.map((pluginType) =>
      getPluginsByType(pluginType, config, context),
    ),
  )
  const pluginsConfigA = Object.fromEntries(pluginsConfigs)
  return { ...config, ...pluginsConfigA }
}

const getPluginsByType = async function (pluginType, config, context) {
  const topConfig = getTopConfig(config, pluginType)
  const plugins = await loadPlugins({ pluginType, config, topConfig, context })
  return [pluginType.varName, plugins]
}
