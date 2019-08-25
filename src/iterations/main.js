import { loadRunners } from '../run/load.js'
import { addNames } from '../print/name.js'
import { validateLimits } from '../limit/validate.js'

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
  system,
  tasks: taskIds,
  variations: variationIds,
  run: runners,
  limits,
}) {
  const taskPaths = await getTaskPaths(files, cwd)

  const { runners: runnersA, versions } = await loadRunners(runners, taskPaths)

  const iterationsB = await getAllIterations({
    taskPaths,
    runners: runnersA,
    duration,
    cwd,
    debug,
    system,
    taskIds,
    variationIds,
    limits,
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
  system,
  taskIds,
  variationIds,
  limits,
}) {
  const iterations = await loadIterations({
    taskPaths,
    runners,
    duration,
    cwd,
    debug,
    system,
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

  validateLimits(iterationsB, limits)

  return iterationsB
}
