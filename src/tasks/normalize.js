// Normalize tasks from an object to an array
export const normalizeTasks = function(tasks) {
  return Object.entries(tasks).map(normalizeTask)
}

// Task `title` defaults to the function variable name. The `title` is used by
// reporters while the `taskId` is used for identification.
const normalizeTask = function([taskId, task]) {
  const { title = taskId, ...taskA } = normalizeTaskFunc(task)
  return { ...taskA, taskId, title }
}

// Tasks can be functions as a shortcut to `{ main() { ... } }`
const normalizeTaskFunc = function(task) {
  if (typeof task === 'function') {
    return { main: task }
  }

  return task
}
