import { validateLimits } from '../limit/validate.js'
import { listTasks } from '../run/list.js'
import { loadRunners } from '../run/load.js'
import { selectCombinations } from '../select/main.js'

import { getCombinationsIds } from './get_ids.js'
import { getInputs } from './inputs.js'
import { getCombinationsProduct } from './product.js'
import { addTitles } from './titles.js'
import { validateCombinationsIds } from './validate_ids.js'

// Retrieve each combination, i.e. combination of each dimension
export const getCombinations = async function ({
  tasks,
  runners,
  inputs,
  systemId,
  include,
  exclude,
  titles,
  limits,
}) {
  const tasksA = listTasks(tasks)
  const [runnersA, inputsA] = await Promise.all([
    loadRunners(tasksA, runners),
    getInputs(inputs),
  ])

  const combinations = getCombinationsProduct({
    tasks: tasksA,
    runners: runnersA,
    inputs: inputsA,
    systemId,
  })
  const { combinations: combinationsA, combinationsIds } = getCombinationsIds(
    combinations,
  )
  validateCombinationsIds(combinationsIds)

  const combinationsB = selectCombinations(combinationsA, combinationsIds, {
    include,
    exclude,
  })

  const combinationsC = addTitles(combinationsB, titles)
  validateLimits(combinationsC, limits)
  return combinationsC
}
