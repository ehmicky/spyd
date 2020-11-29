import { validateLimits } from '../limit/validate.js'
import { addTitles } from '../report/utils/title/main.js'
import { loadRunners } from '../run/load.js'
import { selectCombinations } from '../select/main.js'

import { removeDuplicates } from './duplicate.js'
import { loadCombinations } from './load.js'
import { getTaskPaths } from './path.js'

// Retrieve each combination, i.e. combination of task + input (if any)
export const getCombinations = async function ({
  files,
  duration,
  cwd,
  system,
  tasks,
  inputs,
  run: runners,
  limits,
}) {
  const taskPaths = await getTaskPaths(files, cwd)

  const runnersA = await loadRunners(runners, taskPaths)

  const combinations = await getAllCombinations({
    taskPaths,
    runners: runnersA,
    duration,
    cwd,
    system,
    tasks,
    inputs,
    limits,
  })

  const combinationsA = addTitles(combinations)
  return { combinations: combinationsA }
}

const getAllCombinations = async function ({
  taskPaths,
  runners,
  duration,
  cwd,
  system,
  tasks,
  inputs,
  limits,
}) {
  const combinations = await loadCombinations({
    taskPaths,
    runners,
    duration,
    cwd,
    system,
  })

  const combinationsA = removeDuplicates(combinations)
  const combinationsB = selectCombinations(combinationsA, { tasks, inputs })

  validateLimits(combinationsB, limits)

  return combinationsB
}
