import { loadTaskFile } from '../processes/main.js'

import { getTaskPaths } from './path.js'
import { addPaddings } from './paddings.js'

// Retrieve each iteration, i.e. combination of task + variation (if any)
export const getIterations = async function({ files, cwd, requireOpt }) {
  const taskPaths = await getTaskPaths(files, cwd)

  const iterations = await loadIterations(taskPaths, requireOpt)

  const iterationsA = addPaddings(iterations)
  return iterationsA
}

const loadIterations = async function(taskPaths, requireOpt) {
  const promises = taskPaths.map(taskPath => loadFile(taskPath, requireOpt))
  const iterations = await Promise.all(promises)
  const iterationsA = iterations.flat().filter(removeDuplicates)
  return iterationsA
}

const loadFile = async function(taskPath, requireOpt) {
  const iterations = await loadTaskFile(taskPath, requireOpt)
  return iterations.map(
    ({
      taskId,
      taskTitle = taskId,
      variationId,
      variationTitle = variationId,
    }) => ({
      taskId,
      taskTitle,
      variationId,
      variationTitle,
      taskPath,
    }),
  )
}

// When two `files` define the same iteration, the last one prevails
const removeDuplicates = function({ taskId, variationId }, index, iterations) {
  return iterations
    .slice(index + 1)
    .every(
      iteration =>
        iteration.taskId !== taskId || iteration.variationId !== variationId,
    )
}
