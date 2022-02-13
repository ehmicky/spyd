// Custom merging logic for tasks.
// `tasks` or `runner.tasks` are concatenated, not overridden so that shared
// configurations consumers can add tasks.
export const isTasks = function (keys) {
  return isTopTasks(keys) || isRunnerTasks(keys)
}

const isTopTasks = function (keys) {
  return keys.length === 1 && keys[0] === 'tasks'
}

const isRunnerTasks = function (keys) {
  return (
    keys[0] === 'runner' &&
    keys[keys.length - 1] === 'tasks' &&
    (keys.length === 2 || keys.length === 3)
  )
}

// Order matters since later `tasks` have priority when merging two task files
// with same task ids.
export const mergeTasks = function (tasksA, tasksB) {
  const tasksArrA = normalizeOptionalArray(tasksA)
  const tasksArrB = normalizeOptionalArray(tasksB)
  return [...tasksArrA, ...tasksArrB]
}

const normalizeOptionalArray = function (value = []) {
  return Array.isArray(value) ? value : [value]
}
