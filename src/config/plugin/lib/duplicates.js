import { ConsumerError } from './error.js'

// Specifying the same plugin id twice:
//  - Might be a user error
//  - Might not work with the user's logic if it does not handle duplicate
//    instances of the same plugin properly
//     - Also, the configuration objects are shallowly cloned, but not deeply,
//       which might be unexpected by the consumer if those are modified
// Therefore, it must be explicitly allowed using `duplicates: true`.
// Plugin's identity is checked using `plugin.id`, which works with:
//  - Inline ids
//  - The same module or file being referenced in different ways
export const validateDuplicatePlugins = function (
  pluginInfos,
  { name, duplicates },
) {
  if (duplicates) {
    return
  }

  const duplicatePluginInfo = pluginInfos.find(isDuplicateId)

  if (duplicatePluginInfo === undefined) {
    return
  }

  const duplicateId = getPluginId(duplicatePluginInfo)
  throw new ConsumerError(
    `Configuration property "${name}" must not contain the same "id" "${duplicateId}" multiple times`,
  )
}

const isDuplicateId = function (pluginInfo, index, pluginInfos) {
  const id = getPluginId(pluginInfo)
  return pluginInfos.some(
    (pluginInfoA, indexA) => index > indexA && id === getPluginId(pluginInfoA),
  )
}

const getPluginId = function ({ plugin: { id } }) {
  return id
}
