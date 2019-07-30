export const loadTaskFile = function(taskPath) {
  // TODO: replace with `import()` once it is supported by default by ESLint
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const tasks = require(taskPath)
  const tasksA = normalizeTasks(tasks)
  return tasksA
}

const normalizeTasks = function(tasks) {
  return Object.entries(tasks).map(normalizeTask)
}

const normalizeTask = function([taskId, task]) {
  const { title = taskId, ...taskA } = normalizeTaskFunc(task)
  return { ...taskA, taskId, title }
}

const normalizeTaskFunc = function(task) {
  if (typeof task === 'function') {
    return { main: task }
  }

  return task
}
