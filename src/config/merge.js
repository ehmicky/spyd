import deepMergeLib from 'deepmerge'

// Deeply merge several objects.
// Used to merge:
//  - shared `config`
//  - `spyd.*` with CLI flags
//  - top-level `config` with plugin-specific one
export const deepMerge = function (objects) {
  return deepMergeLib.all(objects, { arrayMerge })
}

// Override arrays instead of concatenating.
// This includes array of objects as this is simpler for users.
const arrayMerge = function (arrayA, arrayB) {
  return arrayB
}
