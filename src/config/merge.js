import isPlainObj from 'is-plain-obj'

import { PLUGIN_TYPES } from '../plugin/types.js'

import { normalizeOptionalArray } from './check.js'
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

// `tasks` or `runnnerConfig.{runnerId}.tasks` are concatenated, not overridden
// so that shared configurations consumers can add tasks
const isTasks = function (keys) {
  return isTopTasks(keys) || isRunnerTasks(keys)
}

const isTopTasks = function (keys) {
  return keys.length === 1 && keys[0] === 'tasks'
}

const isRunnerTasks = function (keys) {
  return (
    keys.length === 3 &&
    keys[0] === PLUGIN_TYPES.runner.configProp &&
    keys[2] === 'tasks'
  )
}

// Order matters since later `tasks` have priority when merging two task files
// with same task ids.
const mergeTasks = function (tasksA, tasksB) {
  const tasksArrA = normalizeOptionalArray(tasksA)
  const tasksArrB = normalizeOptionalArray(tasksB)
  return [...tasksArrA, ...tasksArrB]
}

const CUSTOM_MERGES = [{ condition: isTasks, applyFunc: mergeTasks }]
