import { normalizePluginConfig } from './config.js'
import { PluginError, addErrorBugsUrl } from './error.js'
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
    const { plugin: pluginA, config: pluginConfigB } =
      await normalizePluginInfo({
        pluginConfig: pluginConfigA,
        plugin,
        locationType,
        originalLocation,
        opts,
      })
    return { plugin: pluginA, config: pluginConfigB, path }
  } catch (error) {
    throw addPluginErrorLocation(error, originalLocation)
  }
}

const normalizePluginInfo = async function ({
  pluginConfig,
  plugin,
  locationType,
  originalLocation,
  opts,
}) {
  try {
    const pluginA = await normalizeCommonShape({
      plugin,
      locationType,
      originalLocation,
      opts,
    })
    const { config: pluginConfigRules, ...pluginB } =
      await normalizeCustomShape(pluginA, opts)
    const pluginConfigA = await normalizePluginConfig({
      pluginConfig,
      plugin: pluginB,
      pluginConfigRules,
      opts,
    })
    return { plugin: pluginB, config: pluginConfigA }
  } catch (error) {
    throw addPluginErrorBugsUrl(error, plugin)
  }
}

const addPluginErrorBugsUrl = function (error, { bugsUrl }) {
  return error instanceof PluginError ? addErrorBugsUrl(error, bugsUrl) : error
}

const addPluginErrorLocation = function (error, originalLocation) {
  return error instanceof PluginError
    ? new Error(`Invalid plugin "${originalLocation}".`, { cause: error })
    : error
}
