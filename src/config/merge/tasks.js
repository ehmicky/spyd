import { normalizeOptionalArray } from '../normalize/check.js'
import { PLUGIN_TYPES } from '../plugin/types.js'

// Custom merging logic for tasks.
// `tasks` or `runnnerConfig.{runnerId}.tasks` are concatenated, not overridden
// so that shared configurations consumers can add tasks.
export const isTasks = function (keys) {
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
export const mergeTasks = function (tasksA, tasksB) {
  const tasksArrA = normalizeOptionalArray(tasksA)
  const tasksArrB = normalizeOptionalArray(tasksB)
  return [...tasksArrA, ...tasksArrB]
}
