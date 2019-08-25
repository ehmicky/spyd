// `taskTitle` defaults to the function variable name. `taskTitle` is used by
// reporters while the `taskId` is used for identification.
export const normalizeTasks = function({ tasks, variations }) {
  const tasksA = tasks.map(normalizeTask)
  return { tasks: tasksA, variations }
}

const normalizeTask = function({
  id: taskId,
  title: taskTitle,
  variations: variationsIds,
  main,
  before,
  after,
}) {
  return { taskId, taskTitle, variationsIds, main, before, after }
}
