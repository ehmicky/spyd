import { getTaskPaths } from './path.js'
import { loadIterations } from './load.js'
import { selectIterations } from './select.js'
import { addPaddings } from './paddings.js'

// Retrieve each iteration, i.e. combination of task + variation (if any)
export const getIterations = async function({
  files,
  cwd,
  tasks: taskIds,
  variations: variationIds,
  runOpts,
}) {
  const taskPaths = await getTaskPaths(files, cwd)

  const iterations = await loadIterations(taskPaths, runOpts)

  const iterationsA = iterations.filter(removeDuplicates)
  const iterationsB = selectIterations({
    iterations: iterationsA,
    taskIds,
    variationIds,
  })

  if (iterationsB.length === 0) {
    throw new Error('No tasks to bechmark')
  }

  const iterationsC = addPaddings(iterationsB)
  return iterationsC
}

// When two `files` define the same iteration, the last one prevails
const removeDuplicates = function(
  { taskId, variationId, runnerId },
  index,
  iterations,
) {
  return iterations
    .slice(index + 1)
    .every(
      iteration =>
        iteration.taskId !== taskId ||
        iteration.variationId !== variationId ||
        iteration.runnerId !== runnerId,
    )
}
