import { loadRunners } from '../run/load.js'
import { normalizeTitles } from '../print/titles.js'

import { getTaskPaths } from './path.js'
import { loadIterations } from './load.js'
import { selectIterations } from './select.js'

// Retrieve each iteration, i.e. combination of task + variation (if any)
export const getIterations = async function({
  files,
  duration,
  cwd,
  tasks: taskIds,
  variations: variationIds,
  run: runners,
}) {
  const taskPaths = await getTaskPaths(files, cwd)

  const { runners: runnersA, versions } = await loadRunners(runners, taskPaths)

  const iterations = await loadIterations({
    taskPaths,
    runners: runnersA,
    duration,
    cwd,
  })

  const iterationsA = iterations.filter(removeDuplicates)
  const iterationsB = selectIterations({
    iterations: iterationsA,
    taskIds,
    variationIds,
  })

  if (iterationsB.length === 0) {
    throw new Error('No tasks to benchmark')
  }

  const iterationsC = normalizeTitles(iterationsB)
  return { iterations: iterationsC, versions }
}

// When two `files` define the same iteration, the last one prevails
const removeDuplicates = function(
  { taskId, variationId, commandId },
  index,
  iterations,
) {
  return iterations
    .slice(index + 1)
    .every(
      iteration =>
        iteration.taskId !== taskId ||
        iteration.variationId !== variationId ||
        iteration.commandId !== commandId,
    )
}
