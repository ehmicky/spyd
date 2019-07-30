import { getTaskPath } from './path.js'
import { loadTaskFile } from './load.js'

export const getIterations = async function(opts) {
  const taskPath = await getTaskPath(opts)
  const tasks = await loadTaskFile(taskPath)
  const iterations = tasks
    .flatMap(getIteration)
    .map(iteration => ({ ...opts, taskPath, ...iteration }))
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
