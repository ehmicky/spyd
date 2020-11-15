import { validateLimits } from '../limit/validate.js'
import { addNames } from '../normalize/name.js'
import { loadRunners } from '../run/load.js'
import { selectIterations } from '../select/main.js'

import { removeDuplicates } from './duplicate.js'
import { loadIterations } from './load.js'
import { getTaskPaths } from './path.js'

// Retrieve each iteration, i.e. combination of task + input (if any)
export const getIterations = async function ({
  files,
  duration,
  cwd,
  debug,
  system,
  tasks,
  inputs,
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
    inputs,
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
  inputs,
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
  const iterationsB = selectIterations(iterationsA, { tasks, inputs })

  validateLimits(iterationsB, limits)

  return iterationsB
}
