import isPlainObj from 'is-plain-obj'

import { isTasks, mergeTasks } from '../run/merge.js'

import { removeEmptyValues } from './empty.js'

// Merge two configuration objects. Used to merge:
//  - shared `config`
//  - `spyd.*` with CLI flags
export const mergeConfigs = function (configs) {
  const configC = configs.reduce(
    (configA, configB) => mergeObjects(configA, configB, []),
    {},
  )
  const configD = removeEmptyValues(configC)
  return configD
}

const mergeObjects = function (objectA, objectB, keys) {
  return Object.entries(objectB).reduce(
    (object, [key, value]) => ({
      ...object,
      [key]: mergeValues(object[key], value, [...keys, key]),
    }),
    objectA,
  )
}

// Arrays do not merge, they override instead.
const mergeValues = function (valueA, valueB, keys) {
  const customMerge = CUSTOM_MERGES.find(({ condition }) => condition(keys))

  if (customMerge !== undefined) {
    return customMerge.applyFunc(valueA, valueB)
  }

  if (isPlainObj(valueA) && isPlainObj(valueB)) {
    return mergeObjects(valueA, valueB, keys)
  }

  return valueB
}

const CUSTOM_MERGES = [{ condition: isTasks, applyFunc: mergeTasks }]
