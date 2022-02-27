import deepMergeLib from 'deepmerge'
import isMergeableObject from 'is-mergeable-object'

// Deeply merge several objects.
// Used to merge:
//  - shared `config`
//  - `spyd.*` with CLI flags
//  - top-level `config` with plugin-specific one
export const deepMerge = function (objects) {
  return deepMergeLib.all(objects, {
    arrayMerge,
    isMergeableObject: canRecurse,
  })
}

// Override arrays instead of concatenating.
// This includes array of objects as this is simpler for users.
const arrayMerge = function (arrayA, arrayB) {
  return arrayB
}

// This is the default value for `deepmerge`.
// We expose it so other pieces of logic which need to work alongside the
// merging logic can mimic it.
export const canRecurse = function (value) {
  return isMergeableObject(value)
}
