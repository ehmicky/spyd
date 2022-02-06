import {
  normalizePluginTypes,
  getTopConfig,
  removeTopProps,
} from './extract.js'
import { loadPlugins } from './load.js'
import { normalizeMainProps } from './main_props.js'

// Generic utility to add plugins which can be selected and configured by users.
// This is optimized for the common use cases, while still allowing complex ones
//  - Plugins without configuration
//  - Single plugin per type, as opposed to multiple
//  - Single configuration per plugin
export const addPlugins = async function ({
  config,
  pluginTypes,
  context,
  configInfos,
}) {
  const pluginTypesA = normalizePluginTypes(pluginTypes)
  const pluginsConfigs = await addPluginsProps({
    config,
    pluginTypes: pluginTypesA,
    context,
    configInfos,
  })
  const configA = removeTopProps(config, pluginTypesA)
  return { ...configA, ...pluginsConfigs }
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
