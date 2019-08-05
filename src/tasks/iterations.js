import { getTaskPath } from './path.js'
import { loadTaskFile } from './load.js'
import { addPaddings } from './paddings.js'

// Retrieve each iteration, i.e. combination of task + variation (if any)
export const getIterations = async function({
  file,
  cwd,
  duration,
  requireOpt,
}) {
  const taskPath = await getTaskPath(file, cwd)
  const tasks = await loadTaskFile({ taskPath, requireOpt })
  const iterations = tasks
    .flatMap(getIteration)
    .map(iteration => ({ ...iteration, taskPath, duration, requireOpt }))
  const iterationsA = addPaddings(iterations)
  return iterationsA
}

const getIteration = function({ taskId, taskTitle, variations }) {
  if (variations === undefined) {
    return [{ taskId, taskTitle }]
  }

  return Object.keys(variations).map(variation => ({
    taskId,
    taskTitle,
    variationId: variation,
    variationTitle: variation,
  }))
}
