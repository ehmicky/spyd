import { validateLimits } from '../limit/validate.js'
import { listTasks } from '../run/list.js'
import { loadRunners } from '../run/load.js'
import { selectCombinations } from '../select/main.js'

import { getInputs } from './inputs.js'
import { getCombinationsProduct } from './product.js'
import { addTitles } from './titles.js'
import { validateCombinationsIds } from './validate.js'

// Retrieve each combination, i.e. combination of each dimension
export const getCombinations = async function ({
  tasks,
  runner,
  inputs,
  systemId,
  include,
  exclude,
  titles,
  limits,
}) {
  const tasksA = listTasks(tasks)
  const [runners, inputsA] = await Promise.all([
    loadRunners(tasksA, runner),
    getInputs(inputs),
  ])

  const combinations = getCombinationsProduct({
    tasks: tasksA,
    runners,
    inputs: inputsA,
    systemId,
  })
  validateCombinationsIds(combinations)

  const combinationsA = selectCombinations(combinations, { include, exclude })

  const combinationsB = addTitles(combinationsA, titles)
  validateLimits(combinationsB, limits)

  return combinationsB
}
