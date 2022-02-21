import { deepMerge } from '../../merge.js'

// When the same plugin is specified twice but with different configurations,
// those configurations are deeply merged, unless the `multiple` option is true.
// `multiple` default to `false` because:
//  - The consumer's logic might not work with multiple instances of the same
//    plugin
//  - The configuration objects are shallowly cloned, but not deeply, which
//    might be unexpected by the consumer if those are modified
// Plugin's identity is checked by using `===` on the `pluginConfig.id`:
//  - For inline ids, this allows them to use this feature by shallowly cloning
//    or not
//  - For file path and module ids, this is done after full resolution and
//    normalization to ensure uniqueness
// The `pluginConfigs` are merged to the first one, which has the least
// priority:
//  - The next ones are replaced with an empty object and filtered out later
//     - This ensures the error message reports the same index as specified by
//       users in the input
export const handleMultiple = function (
  pluginConfigs,
  { multiple, pluginProp },
) {
  return multiple
    ? pluginConfigs
    : pluginConfigs.map(
        handleDuplicatePlugin.bind(undefined, pluginProp, pluginConfigs),
      )
}

const handleDuplicatePlugin = function (
  pluginProp,
  pluginConfigs,
  pluginConfig,
) {
  if (pluginConfig[pluginProp] === undefined) {
    return pluginConfig
  }

  const duplicatePlugins = pluginConfigs.filter(
    (pluginConfigB) => pluginConfig[pluginProp] === pluginConfigB[pluginProp],
  )

  if (duplicatePlugins.length === 1) {
    return pluginConfig
  }

  return duplicatePlugins[0] === pluginConfig ? deepMerge(duplicatePlugins) : {}
}
