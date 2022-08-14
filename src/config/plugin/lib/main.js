import { validateDuplicatePlugins } from './duplicates.js'
import { createErrorTypes } from './error.js'
import { getPluginInfo } from './info.js'
import { normalizeMultipleOpts, normalizeSingleOpts } from './options.js'

// Generic utility to add plugins which can be selected and configured by users.
// This is optimized for the common use cases, while still allowing complex ones
//  - Plugins without configuration
//  - Single plugin per type, as opposed to multiple
//  - Single configuration per plugin
// We purposely leave the responsibility to the consumer to:
//  - Check for requiredness, i.e. the main argument is assumed to be defined
//     - I.e. it being undefined is a user error, not consumer
//     - However, undefined values inside an array of `pluginConfigs` is a
//       consumer error since users are not expected to know about the shape
//       of `pluginConfigs` elements (due to its polymorphic syntax)
//  - Assign default values
// The logic tries its best to pass the right `parent` to configuration rules,
// despite the syntax being polymorphic due to:
//  - The top-level array being optional
//  - The shortcut syntax allowing passing the identifier string instead of a
//    pluginConfig object
//  - pluginConfig coming both from each pluginConfig object and from
//    `opts.sharedConfig`
export const getPlugins = async function (pluginConfigs, opts) {
  const { errorHandler, ...optsA } = createErrorTypes(opts)

  try {
    const optsB = normalizeMultipleOpts(optsA)
    validateDefined(pluginConfigs, optsB)
    const pluginInfos = await getPluginInfos(pluginConfigs, optsB)
    validateDuplicatePlugins(pluginInfos, optsB)
    return pluginInfos
  } catch (error) {
    throw errorHandler(error)
  }
}

const getPluginInfos = async function (pluginConfigs, opts) {
  return Array.isArray(pluginConfigs)
    ? await Promise.all(
        pluginConfigs.map(getEachPluginInfo.bind(undefined, opts)),
      )
    : [await getPluginInfo(pluginConfigs, opts)]
}

const getEachPluginInfo = async function (opts, pluginConfig, index) {
  const name = `${opts.name}.${index}`
  return await getPluginInfo(pluginConfig, { ...opts, name })
}

// Retrieve a single plugin instead of an optional array of them
export const getPlugin = async function (pluginConfig, opts) {
  const { errorHandler, ...optsA } = createErrorTypes(opts)

  try {
    const optsB = normalizeSingleOpts(optsA)
    validateDefined(pluginConfig, optsB)
    const plugin = await getPluginInfo(pluginConfig, optsB)
    return plugin
  } catch (error) {
    throw errorHandler(error)
  }
}

const validateDefined = function (value, { name, UserError }) {
  if (value === undefined) {
    throw new UserError(`Configuration property "${name}" must be defined.`)
  }
}
