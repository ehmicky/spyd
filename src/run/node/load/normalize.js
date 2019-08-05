// `taskTitle` defaults to the function variable name. `taskTitle` is used by
// reporters while the `taskId` is used for identification.
export const normalizeTasks = function({ variations, ...tasks }, taskPath) {
  const tasksA = Object.entries(tasks).map(([taskId, task]) =>
    normalizeTask({ taskId, task, taskPath }),
  )
  return { tasks: tasksA, variations }
}

const normalizeTask = function({ taskId, task, taskPath }) {
  const {
    title: taskTitle = taskId,
    variations: variationsIds,
    main,
    before,
    after,
  } = normalizeMain(task)
  return { taskPath, taskId, taskTitle, variationsIds, main, before, after }
}

// Tasks can be functions as a shortcut to `{ main() { ... } }`
const normalizeMain = function(task) {
  if (typeof task === 'function') {
    return { main: task }
  }

  return task
}
