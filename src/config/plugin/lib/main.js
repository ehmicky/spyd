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
  cwd,
}) {
  const pluginTypesA = normalizePluginTypes(pluginTypes)
  const pluginsConfigs = await addPluginsProps({
    config,
    pluginTypes: pluginTypesA,
    context,
    cwd,
  })
  const configA = removeTopProps(config, pluginTypesA)
  return { ...configA, ...pluginsConfigs }
}

const addPluginsProps = async function ({ config, pluginTypes, context, cwd }) {
  const pluginsConfigs = await Promise.all(
    pluginTypes.map((pluginType) =>
      getPluginsByType({ pluginType, config, context, cwd }),
    ),
  )
  return Object.fromEntries(pluginsConfigs)
}

const getPluginsByType = async function ({ pluginType, config, context, cwd }) {
  const topConfig = getTopConfig(config, pluginType)
  const configA = await normalizeMainProps({
    config,
    pluginType,
    context,
    cwd,
  })
  const plugins = await loadPlugins({
    pluginType,
    config: configA,
    topConfig,
    context,
    cwd,
  })
  return [pluginType.name, plugins]
}
