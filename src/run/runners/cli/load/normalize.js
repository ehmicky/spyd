// `taskTitle` defaults to the function variable name. `taskTitle` is used by
// reporters while the `taskId` is used for identification.
export const normalizeTasks = function(
  { variations, shell = DEFAULT_SHELL, ...tasks },
  taskPath,
) {
  const tasksA = Object.entries(tasks).map(([taskId, task]) =>
    normalizeTask({ taskId, task, taskPath }),
  )
  return { tasks: tasksA, variations, shell }
}

const DEFAULT_SHELL = true

const normalizeTask = function({
  taskId,
  task: { title: taskTitle, variations: variationsIds, main, before, after },
  taskPath,
}) {
  return { taskPath, taskId, taskTitle, variationsIds, main, before, after }
}
