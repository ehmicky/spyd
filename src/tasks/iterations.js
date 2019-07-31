import { getTaskPath } from './path.js'
import { loadTaskFile } from './load.js'

// Retrieve each iteration, i.e. combination of task + parameter (if any)
export const getIterations = async function({ file, cwd, duration }) {
  const taskPath = await getTaskPath(file, cwd)
  const tasks = await loadTaskFile(taskPath)
  const iterations = tasks
    .flatMap(getIteration)
    .map(iteration => ({ ...iteration, duration, taskPath }))
  return iterations
}

const getIteration = function({ taskId, title, parameters }) {
  if (parameters === undefined) {
    return [{ taskId, title }]
  }

  return Object.keys(parameters).map(parameter => ({
    taskId,
    title,
    parameter,
  }))
}
