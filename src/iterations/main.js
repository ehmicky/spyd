import { validateLimits } from '../limit/validate.js'
import { addNames } from '../print/name.js'
import { loadRunners } from '../run/load.js'
import { selectIterations } from '../select/main.js'

import { removeDuplicates } from './duplicate.js'
import { loadIterations } from './load.js'
import { getTaskPaths } from './path.js'

// Retrieve each iteration, i.e. combination of task + variation (if any)
export const getIterations = async function ({
  files,
  duration,
  cwd,
  debug,
  system,
  tasks,
  variations,
  run: runners,
  limits,
}) {
  const taskPaths = await getTaskPaths(files, cwd)

  const runnersA = await loadRunners(runners, taskPaths)

  const iterationsB = await getAllIterations({
    taskPaths,
    runners: runnersA,
    duration,
    cwd,
    debug,
    system,
    tasks,
    variations,
    limits,
  })

  const iterationsC = addNames(iterationsB)
  return { iterations: iterationsC }
}

const getAllIterations = async function ({
  taskPaths,
  runners,
  duration,
  cwd,
  debug,
  system,
  tasks,
  variations,
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
  const iterationsB = selectIterations(iterationsA, { tasks, variations })

  validateLimits(iterationsB, limits)

  return iterationsB
}
