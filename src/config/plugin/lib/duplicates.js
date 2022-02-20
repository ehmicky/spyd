import { ConsumerError } from './error.js'

// Specifying the same plugin id twice:
//  - Might be a user error
//  - Might not work with the user's logic if it does not handle duplicate
//    instances of the same plugin properly
//     - Also, the configuration objects are shallowly cloned, but not deeply,
//       which might be unexpected by the consumer if those are modified
// Therefore, it must be explicitely allowed using `duplicates: true`.
// Plugin's identity is checked using `plugin.id`, which works with:
//  - Inline ids
//  - The same module or file being referenced in different ways
export const validateDuplicatePlugins = function (
  plugins,
  { name, duplicates },
) {
  if (duplicates) {
    return
  }

  const duplicateId = plugins.map(getPluginId).find(isDuplicateId)

  if (duplicateId !== undefined) {
    throw new ConsumerError(
      `Configuration property "${name}" must not contain the same "id" "${duplicateId}" multiple times`,
    )
  }
}

const getPluginId = function ({ plugin: { id } }) {
  return id
}

const isDuplicateId = function (id, index, ids) {
  return ids.some((idA, indexA) => index > indexA && id === idA)
}
