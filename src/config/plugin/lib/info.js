import { normalizePluginConfig } from './config.js'
import { importPlugin } from './import.js'
import { normalizeLocation } from './location_normalize.js'
import { getLocationType } from './location_type.js'
import { normalizeShape } from './shape.js'
import { normalizePluginConfigTop } from './top.js'

// Get each `pluginInfo`, i.e. normalized `plugin` + `pluginConfig`
export const getPluginInfo = async function (pluginConfig, opts) {
  const {
    originalLocation,
    pluginConfig: pluginConfigA,
    locationName,
  } = await normalizePluginConfigTop(pluginConfig, opts)

  try {
    const locationType = getLocationType(originalLocation, opts)
    const location = await normalizeLocation({
      originalLocation,
      locationType,
      locationName,
      opts,
    })
    const { plugin, path } = await importPlugin(location, locationType, opts)
    const { config: pluginConfigRules, ...pluginA } = await normalizeShape({
      plugin,
      locationType,
      originalLocation,
      opts,
    })
    const pluginConfigB = await normalizePluginConfig({
      pluginConfig: pluginConfigA,
      plugin: pluginA,
      pluginConfigRules,
      opts,
    })
    return { plugin: pluginA, path, config: pluginConfigB }
  } catch (error) {
    throw handlePluginError(error, originalLocation, opts)
  }
}

const handlePluginError = function (error, originalLocation, { PluginError }) {
  return error instanceof PluginError
    ? new Error(`Invalid plugin "${originalLocation}".`, { cause: error })
    : error
}
