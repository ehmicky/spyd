import declarativeMerge from 'declarative-merge'
import isPlainObj from 'is-plain-obj'

// Deeply merge several objects.
// Used to merge:
//  - shared `config`
//  - `spyd.*` with CLI flags
//  - top-level `config` with plugin-specific one
// Arrays can be merged using updates objects.
//  - A common use case is to append a parent configuration's array instead of
//    overriding it, for example:
//     - Adding tasks to a shared configuration, to compare them
//     - Changing a reporter's pluginConfig while keeping other reporters
// Objects are merged deeply, but can change this using a `_merge` property
// set to "deep|shallow|set|delete".
export const deepMerge = function ([firstObject, ...objects]) {
  return objects.reduce(deepMergePair, firstObject)
}

export const deepMergePair = function (firstObject, secondObject) {
  return declarativeMerge(firstObject, secondObject)
}

// This is the value for `declarative-merge`.
// We expose it so other pieces of logic which need to work alongside the
// merging logic can mimic it.
export const isRecurseObject = function (value) {
  return isPlainObj(value)
}
