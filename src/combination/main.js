import { listTasks } from '../run/list.js'
import { loadRunners } from '../run/load.js'
import { selectCombinations } from '../select/main.js'
import { addTitles } from '../title/add.js'

import { fromInputsObj } from './inputs.js'
import { getCombinationsProduct } from './product.js'
import { validateCombinationsIds } from './validate_ids.js'

// Retrieve each combination, i.e. combination of each combination category
export const getCombinations = async function ({
  tasks,
  runners,
  inputs,
  systemId,
  include,
  exclude,
  titles,
  cwd,
}) {
  const tasksA = listTasks(tasks)
  const inputsA = fromInputsObj(inputs)
  const { runners: runnersA, systemVersions } = await loadRunners(
    tasksA,
    runners,
    cwd,
  )

  const combinations = getCombinationsProduct({
    tasks: tasksA,
    runners: runnersA,
    inputs: inputsA,
    systemId,
  })
  validateCombinationsIds(combinations, inputsA)

  const combinationsA = selectCombinations(combinations, { include, exclude })

  const combinationsB = addTitles(combinationsA, titles)
  return { combinations: combinationsB, systemVersions }
}
