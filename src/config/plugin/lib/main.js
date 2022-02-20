import { normalizeOptionalArray } from '../../normalize/transform.js'

import { validateDuplicatePlugins } from './duplicates.js'
import { UserError } from './error.js'
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
export const getPlugins = async function (pluginConfigs, opts) {
  const optsA = normalizeMultipleOpts(opts)
  validateDefined(pluginConfigs, optsA)
  const isArray = Array.isArray(pluginConfigs)
  const pluginConfigsA = normalizeOptionalArray(pluginConfigs)
  const pluginInfos = await Promise.all(
    pluginConfigsA.map((pluginConfig, index) =>
      getEachPluginInfo(pluginConfig, optsA, { isArray, index }),
    ),
  )
  validateDuplicatePlugins(pluginInfos, optsA)
  return pluginInfos
}

const getEachPluginInfo = async function (
  pluginConfig,
  opts,
  { isArray, index },
) {
  const name = isArray ? `${opts.name}.${index}` : opts.name
  return await getPluginInfo(pluginConfig, { ...opts, name })
}

export const getPlugin = async function (pluginConfig, opts) {
  const optsA = normalizeSingleOpts(opts)
  validateDefined(pluginConfig, optsA)
  const plugin = await getPluginInfo(pluginConfig, optsA)
  return plugin
}

const validateDefined = function (value, opts) {
  if (value === undefined) {
    throw new UserError(
      `Configuration property "${opts.name}" must be defined.`,
    )
  }
}
