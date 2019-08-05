// Normalize tasks from an object to an array
export const normalizeTasks = function(tasks) {
  return Object.entries(tasks).map(normalizeTask)
}

// `taskTitle` defaults to the function variable name. `taskTitle` is used by
// reporters while the `taskId` is used for identification.
const normalizeTask = function([taskId, task]) {
  const { taskTitle = taskId, ...taskA } = normalizeTaskFunc(task)
  return { ...taskA, taskId, taskTitle }
}

// Tasks can be functions as a shortcut to `{ main() { ... } }`
const normalizeTaskFunc = function(task) {
  if (typeof task === 'function') {
    return { main: task }
  }

  return task
}
