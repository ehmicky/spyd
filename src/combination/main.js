import { validateLimits } from '../limit/validate.js'
import { listTasks } from '../run/list.js'
import { loadRunners } from '../run/load.js'
import { selectCombinations } from '../select/main.js'

import { getInputs } from './input.js'
import { getCombinationsProduct } from './product.js'
import { validateCombinationsIds } from './validate.js'

// Retrieve each combination, i.e. combination of task + input (if any)
export const getCombinations = async function ({
  tasks,
  systemId,
  include,
  exclude,
  runner,
  limits,
}) {
  const tasksA = listTasks(tasks)
  const [runners, inputs] = await Promise.all([
    loadRunners(tasksA, runner),
    getInputs(),
  ])

  const combinations = getCombinationsProduct({
    tasks: tasksA,
    runners,
    inputs,
    systemId,
  })
  validateCombinationsIds(combinations)

  const combinationsA = selectCombinations(combinations, { include, exclude })

  validateLimits(combinationsA, limits)

  return combinationsA
}
