// `taskTitle` defaults to the function variable name. `taskTitle` is used by
// reporters while the `taskId` is used for identification.
export const normalizeTasks = function({ variations, ...tasks }, taskPath) {
  const tasksA = Object.entries(tasks).map(([taskId, task]) =>
    normalizeTask({ taskId, task, taskPath }),
  )
  return { tasks: tasksA, variations }
}

const normalizeTask = function({
  taskId,
  task: { title: taskTitle, variations: variationsIds, main, before, after },
  taskPath,
}) {
  return { taskPath, taskId, taskTitle, variationsIds, main, before, after }
}
