import { normalizeReporters } from '../../../report/config/main.js'

import { getPluginTypes, getTopConfig, removeTopProps } from './extract.js'
import { loadPlugins } from './load.js'
import { normalizeMainProps } from './main_props.js'

// Several configuration properties (`runner`, `reporter`)
// can be customized with custom modules. This loads them. Each type can specify
// builtin modules too.
// Most plugin types need only a single plugin per benchmark, but they still
// allow several for some use cases. Since the most common case is a single
// plugin, selecting plugins:
//  - can be either a string or an array of strings
//  - uses a singular property name
export const addPlugins = async function ({
  config,
  command,
  context,
  configInfos,
}) {
  const pluginTypes = getPluginTypes()
  const pluginsConfigs = await addPluginsProps({
    config,
    pluginTypes,
    context,
    configInfos,
  })
  const configA = removeTopProps(config, pluginTypes)
  const configB = { ...configA, ...pluginsConfigs }
  const configC = normalizeReporters(configB, command)
  return configC
}

const addPluginsProps = async function ({
  config,
  pluginTypes,
  context,
  configInfos,
}) {
  const pluginsConfigs = await Promise.all(
    pluginTypes.map((pluginType) =>
      getPluginsByType({ pluginType, config, context, configInfos }),
    ),
  )
  return Object.fromEntries(pluginsConfigs)
}

const getPluginsByType = async function ({
  pluginType,
  config,
  context,
  configInfos,
}) {
  const topConfig = getTopConfig(config, pluginType)
  const configA = await normalizeMainProps({
    config,
    pluginType,
    context,
    configInfos,
  })
  const plugins = await loadPlugins({
    pluginType,
    config: configA,
    topConfig,
    context,
    configInfos,
  })
  return [pluginType.name, plugins]
}
