import { normalizePluginConfig } from './config.js'
import { PluginError } from './error.js'
import { importPlugin } from './import.js'
import { normalizeLocation } from './location_normalize.js'
import { getLocationType } from './location_type.js'
import { normalizeCommonShape, normalizeCustomShape } from './shape.js'
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
    const pluginA = await normalizeCommonShape({
      plugin,
      locationType,
      originalLocation,
      opts,
    })
    const { config: pluginConfigRules, ...pluginB } =
      await normalizeCustomShape(pluginA, opts)
    const pluginConfigB = await normalizePluginConfig({
      pluginConfig: pluginConfigA,
      plugin: pluginB,
      pluginConfigRules,
      opts,
    })
    return { plugin: pluginB, path, config: pluginConfigB }
  } catch (error) {
    throw handlePluginError(error, originalLocation)
  }
}

const handlePluginError = function (error, originalLocation) {
  return error instanceof PluginError
    ? new Error(`Invalid plugin "${originalLocation}".`, { cause: error })
    : error
}
