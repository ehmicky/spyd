import { onError } from '../../../error/handler.js'

import { validateDuplicatePlugins } from './duplicates.js'
import { UserError, ErrorTypes } from './error.js'
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
  try {
    const optsA = normalizeMultipleOpts(opts)
    validateDefined(pluginConfigs, optsA)
    const pluginInfos = await getPluginInfos(pluginConfigs, optsA)
    validateDuplicatePlugins(pluginInfos, optsA)
    return pluginInfos
  } catch (error) {
    throw onError(error, ErrorTypes)
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
  try {
    const optsA = normalizeSingleOpts(opts)
    validateDefined(pluginConfig, optsA)
    const plugin = await getPluginInfo(pluginConfig, optsA)
    return plugin
  } catch (error) {
    throw onError(error, ErrorTypes)
  }
}

const validateDefined = function (value, { name }) {
  if (value === undefined) {
    throw new UserError(`Configuration property "${name}" must be defined.`)
  }
}
