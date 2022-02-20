import { validateDuplicatePlugins } from './duplicates.js'
import { addPlugin } from './each.js'
import { normalizeList } from './list.js'
import { normalizePluginType } from './type.js'

// Generic utility to add plugins which can be selected and configured by users.
// This is optimized for the common use cases, while still allowing complex ones
//  - Plugins without configuration
//  - Single plugin per type, as opposed to multiple
//  - Single configuration per plugin
export const addPlugins = async function (pluginConfigs, pluginType) {
  const pluginTypeA = normalizePluginType(pluginType)
  const pluginConfigsA = await normalizeList(pluginTypeA, pluginConfigs)
  const plugins = await Promise.all(
    pluginConfigsA.map((pluginConfig) => addPlugin(pluginConfig, pluginTypeA)),
  )
  validateDuplicatePlugins(plugins, pluginTypeA)
  return pluginType.multiple ? plugins : plugins[0]
}
