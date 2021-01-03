import { validateLimits } from '../limit/validate.js'
import { listTasks } from '../run/list.js'
import { loadRunners } from '../run/load.js'
import { selectCombinations } from '../select/main.js'

import { getInputs } from './input.js'
import { getCombinationsProduct } from './product.js'
import { addTitles } from './title.js'
import { validateCombinationsIds } from './validate.js'

// Retrieve each combination, i.e. combination of task + input (if any)
export const getCombinations = async function ({
  tasks,
  runner,
  input,
  systemId,
  include,
  exclude,
  titles,
  limits,
}) {
  const tasksA = listTasks(tasks)
  const [runners, inputs] = await Promise.all([
    loadRunners(tasksA, runner),
    getInputs(input),
  ])

  const combinations = getCombinationsProduct({
    tasks: tasksA,
    runners,
    inputs,
    systemId,
  })
  validateCombinationsIds(combinations)

  const combinationsA = selectCombinations(combinations, { include, exclude })

  const combinationsB = addTitles(combinationsA, titles)
  validateLimits(combinationsB, limits)

  return combinationsB
}
