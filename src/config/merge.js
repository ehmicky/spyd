import deepMerge from 'deepmerge'

// Merge two configuration objects. Used to merge:
//  - `extend` configurations
//  - `spyd.yml` with CLI flags
export const mergeConfigs = function (configA, configB) {
  return deepMerge(configA, configB, { arrayMerge: overrideArray })
}

// Arrays do not merge, they override instead.
const overrideArray = function (arrayA, arrayB) {
  return arrayB
}
