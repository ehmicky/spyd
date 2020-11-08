// Normalize task properties names
export const normalizeTasks = function ({ tasks, inputs }) {
  const tasksA = tasks.map(normalizeTask)
  return { tasks: tasksA, inputs }
}

const normalizeTask = function ({
  id: taskId,
  title: taskTitle,
  inputs: inputsIds,
  main,
  before,
  after,
}) {
  return { taskId, taskTitle, inputsIds, main, before, after }
}
