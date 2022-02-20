import { validateDuplicatePlugins } from './duplicates.js'
import { normalizePlugin } from './each.js'
import { normalizeList } from './list.js'
import { normalizeMultipleOpts, normalizeSingleOpts } from './options.js'

// Generic utility to add plugins which can be selected and configured by users.
// This is optimized for the common use cases, while still allowing complex ones
//  - Plugins without configuration
//  - Single plugin per type, as opposed to multiple
//  - Single configuration per plugin
export const getPlugins = async function (pluginConfigs, opts) {
  const optsA = normalizeMultipleOpts(opts)
  const isArray = Array.isArray(pluginConfigs)
  const pluginConfigsA = await normalizeList(pluginConfigs, optsA)
  const plugins = await Promise.all(
    pluginConfigsA.map((pluginConfig, index) =>
      getEachPlugin(pluginConfig, optsA, { isArray, index }),
    ),
  )
  validateDuplicatePlugins(plugins, optsA)
  return plugins
}

const getEachPlugin = async function (pluginConfig, opts, { isArray, index }) {
  const name = isArray ? `${opts.name}.${index}` : opts.name
  return await normalizePlugin(pluginConfig, { ...opts, name })
}

export const getPlugin = async function (pluginConfig, opts) {
  const optsA = normalizeSingleOpts(opts)
  const plugin = await normalizePlugin(pluginConfig, optsA)
  return plugin
}
