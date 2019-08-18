import { loadRunners } from '../run/load.js'
import { addNames } from '../print/name.js'

import { getTaskPaths } from './path.js'
import { loadIterations } from './load.js'
import { selectIterations } from './select.js'
import { removeDuplicates } from './duplicate.js'

// Retrieve each iteration, i.e. combination of task + variation (if any)
export const getIterations = async function({
  files,
  duration,
  cwd,
  debug,
  tasks: taskIds,
  variations: variationIds,
  run: runners,
}) {
  const taskPaths = await getTaskPaths(files, cwd)

  const { runners: runnersA, versions } = await loadRunners(runners, taskPaths)

  const iterationsB = await getAllIterations({
    taskPaths,
    runners: runnersA,
    duration,
    cwd,
    debug,
    taskIds,
    variationIds,
  })

  const iterationsC = addNames(iterationsB)
  return { iterations: iterationsC, versions }
}

const getAllIterations = async function({
  taskPaths,
  runners,
  duration,
  cwd,
  debug,
  taskIds,
  variationIds,
}) {
  const iterations = await loadIterations({
    taskPaths,
    runners,
    duration,
    cwd,
    debug,
  })

  const iterationsA = removeDuplicates(iterations)
  const iterationsB = selectIterations({
    iterations: iterationsA,
    taskIds,
    variationIds,
  })

  if (iterationsB.length === 0) {
    throw new Error('No tasks to benchmark')
  }

  return iterationsB
}
