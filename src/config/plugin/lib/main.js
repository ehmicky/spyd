import { addPlugin } from './each.js'
import { normalizeList } from './list.js'
import { getSharedConfig } from './shared.js'
import { normalizePluginType } from './type.js'

// Generic utility to add plugins which can be selected and configured by users.
// This is optimized for the common use cases, while still allowing complex ones
//  - Plugins without configuration
//  - Single plugin per type, as opposed to multiple
//  - Single configuration per plugin
export const addPlugins = async function (
  pluginConfigs,
  pluginType,
  { sharedConfig = {}, context, cwd } = {},
) {
  const pluginTypeA = normalizePluginType(pluginType)
  const { sharedConfig: sharedConfigA, sharedPropNames } = getSharedConfig(
    sharedConfig,
    pluginTypeA,
  )
  const pluginConfigsA = await normalizeList({
    pluginConfigs,
    pluginType: pluginTypeA,
    context,
    cwd,
  })
  const pluginsCount = pluginConfigsA.length
  return await Promise.all(
    pluginConfigsA.map((pluginConfig, index) =>
      addPlugin(pluginTypeA, {
        pluginConfig,
        index,
        pluginsCount,
        sharedPropNames,
        sharedConfig: sharedConfigA,
        context,
        cwd,
      }),
    ),
  )
}
