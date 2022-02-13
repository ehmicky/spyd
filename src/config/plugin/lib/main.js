import { addPlugin } from './each.js'
import { normalizeList } from './list.js'
import { handleMultiple } from './multiple.js'
import { applySharedConfigs } from './shared_config.js'
import { getSharedConfigPropNames } from './shared_names.js'
import { normalizePluginType } from './type.js'

// Generic utility to add plugins which can be selected and configured by users.
// This is optimized for the common use cases, while still allowing complex ones
//  - Plugins without configuration
//  - Single plugin per type, as opposed to multiple
//  - Single configuration per plugin
export const addPlugins = async function (
  pluginConfigs,
  pluginType,
  { context, cwd } = {},
) {
  const pluginTypeA = normalizePluginType(pluginType)
  const pluginConfigsA = await normalizeList({
    pluginConfigs,
    pluginType: pluginTypeA,
    context,
    cwd,
  })
  const sharedPropNames = getSharedConfigPropNames(pluginTypeA)
  const pluginConfigsB = applySharedConfigs(pluginConfigsA, pluginTypeA)
  const pluginConfigsC = handleMultiple(pluginConfigsB, pluginTypeA)
  const pluginsCount = pluginConfigsC.length
  const plugins = await Promise.all(
    pluginConfigsC.map((pluginConfig, index) =>
      addPlugin(pluginTypeA, {
        pluginConfig,
        index,
        pluginsCount,
        sharedPropNames,
        context,
        cwd,
      }),
    ),
  )
  return plugins.filter(Boolean)
}
