import { wrapError } from '../../../error/wrap.js'

import { normalizePluginConfig } from './config.js'
import { PluginError } from './error.js'
import { importPlugin } from './import.js'
import { getLocationInfo } from './location_info.js'
import { normalizeLocation } from './location_normalize.js'
import { normalizeShape } from './shape.js'
import { normalizePluginConfigTop } from './top.js'

// Get each `pluginInfo`, i.e. normalized `plugin` + `pluginConfig`
export const getPluginInfo = async function (pluginConfig, opts) {
  const pluginConfigA = await normalizePluginConfigTop(pluginConfig, opts)
  const { originalLocation, locationType } = getLocationInfo(
    pluginConfigA,
    opts,
  )

  try {
    const { pluginConfig: pluginConfigB, location } = await normalizeLocation(
      pluginConfigA,
      locationType,
      opts,
    )
    const { plugin, path } = await importPlugin(location, locationType, opts)
    const { config: pluginConfigRules, ...pluginA } = await normalizeShape({
      plugin,
      locationType,
      originalLocation,
      opts,
    })
    const pluginConfigC = await normalizePluginConfig({
      pluginConfig: pluginConfigB,
      plugin: pluginA,
      pluginConfigRules,
      opts,
    })
    return { plugin: pluginA, path, config: pluginConfigC }
  } catch (error) {
    throw handlePluginError(error, originalLocation)
  }
}

const handlePluginError = function (error, originalLocation) {
  return error instanceof PluginError
    ? wrapError(error, `Invalid plugin "${originalLocation}":`)
    : error
}
