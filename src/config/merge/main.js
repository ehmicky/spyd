import deepmerge from 'deepmerge'

// Merge two configuration objects. Used to merge:
//  - shared `config`
//  - `spyd.*` with CLI flags
//  - top-level `config` with plugin-specific one
export const mergeConfigs = function (configs) {
  return deepmerge.all(configs, { arrayMerge })
}

const arrayMerge = function (arrayA, arrayB) {
  return arrayB
}
