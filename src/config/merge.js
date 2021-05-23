import deepMerge from 'deepmerge'

// Merge two configuration objects. Used to merge:
//  - shared `config`
//  - `spyd.*` with CLI flags
export const mergeConfigs = function (configs) {
  return deepMerge.all(configs, { arrayMerge: overrideArray })
}

// Arrays do not merge, they override instead.
const overrideArray = function (arrayA, arrayB) {
  return arrayB
}
