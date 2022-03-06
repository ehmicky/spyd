import deepMergeLib from 'deepmerge'
import isPlainObj from 'is-plain-obj'

// Deeply merge several objects.
// Used to merge:
//  - shared `config`
//  - `spyd.*` with CLI flags
//  - top-level `config` with plugin-specific one
export const deepMerge = function (objects) {
  return deepMergeLib.all(objects, { isMergeableObject: isRecurseObject })
}

// This is the default value for `deepmerge@v5`.
// Except we do not recurse on arrays, so that arrays are overridden instead of
// being concatenated.
// This includes array of objects as this is simpler for users.
// We expose it so other pieces of logic which need to work alongside the
// merging logic can mimic it.
export const isRecurseObject = function (value) {
  return isPlainObj(value)
}
