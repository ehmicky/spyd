// `taskTitle` defaults to the function variable name. `taskTitle` is used by
// reporters while the `taskId` is used for identification.
export const normalizeTasks = function({ variations, ...tasks }) {
  const tasksA = Object.entries(tasks).map(([taskId, task]) =>
    normalizeTask({ taskId, task }),
  )
  return { tasks: tasksA, variations }
}

const normalizeTask = function({
  taskId,
  task: { title: taskTitle, variations: variationsIds, main, before, after },
}) {
  return { taskId, taskTitle, variationsIds, main, before, after }
}
