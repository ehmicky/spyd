import { wrapError } from '../../../error/wrap.js'

import { normalizePluginConfig } from './config.js'
import { PluginError } from './error.js'
import { importPlugin } from './import.js'
import { normalizeItem } from './item.js'
import { normalizeShape } from './shape.js'

// Get each `pluginInfo`, i.e. normalized `plugin` + `pluginConfig`
export const getPluginInfo = async function (pluginConfig, opts) {
  const {
    [opts.pluginProp]: location,
    moduleId,
    ...pluginConfigA
  } = await normalizeItem(pluginConfig, opts)

  try {
    const { plugin, path } = await importPlugin(location, opts)
    const { config: pluginConfigDefinitions, ...pluginA } =
      await normalizeShape(plugin, moduleId, opts)
    const pluginConfigB = await normalizePluginConfig({
      pluginConfig: pluginConfigA,
      plugin: pluginA,
      pluginConfigDefinitions,
      opts,
    })
    return { plugin: pluginA, path, config: pluginConfigB }
  } catch (error) {
    throw handlePluginError(error, location)
  }
}

const handlePluginError = function (error, location) {
  return error instanceof PluginError
    ? wrapError(error, `Invalid plugin "${location}":`)
    : error
}
