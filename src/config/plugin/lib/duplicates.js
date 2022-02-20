import { deepMerge } from '../../merge.js'

// When the same plugin is specified twice but with different configurations
// objects (which might be identical or not), those configurations are deeply
// merged, unless the `duplicates` option is true.
// `duplicates` default to `false` because:
//  - The consumer's logic might not work with duplicate instances of the same
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
export const handleDuplicatePlugins = function ({
  pluginConfig,
  index,
  pluginConfigs,
  duplicates,
  pluginProp,
}) {
  if (duplicates) {
    return { pluginConfig }
  }

  const duplicateConfigs = pluginConfigs.map((pluginConfigA) =>
    pluginConfig[pluginProp] === pluginConfigA[pluginProp]
      ? pluginConfigA
      : undefined,
  )
  const cleanConfigs = duplicateConfigs.filter(Boolean)

  if (cleanConfigs.length === 1) {
    return { pluginConfig }
  }

  if (index !== 0) {
    return { pluginConfig: {} }
  }

  const pluginConfigB = deepMerge(cleanConfigs)
  return { pluginConfig: pluginConfigB, duplicateConfigs }
}
