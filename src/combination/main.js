import { listTasks } from '../run/list.js'
import { loadRunners } from '../run/load.js'
import { selectCombinations } from '../select/main.js'

import { fromInputsObj } from './inputs.js'
import { getCombinationsProduct } from './product.js'
import { validateCombinationsIds } from './validate_ids.js'

// Retrieve each combination, i.e. combination of each combination category
export const getCombinations = async function ({
  tasks,
  runners,
  inputs,
  systemId,
  select,
  cwd,
}) {
  const { runners: runnersA, systemVersions } = await loadRunners(runners, cwd)
  const tasksA = await listTasks({ tasks, runners: runnersA, cwd })
  const inputsA = fromInputsObj(inputs)

  const combinations = getCombinationsProduct({
    runners: runnersA,
    tasks: tasksA,
    inputs: inputsA,
    systemId,
  })
  validateCombinationsIds(combinations, inputsA)

  const combinationsA = selectCombinations(combinations, select)
  const combinationsB = combinationsA.map(addIndex)
  return { combinations: combinationsB, systemVersions }
}

const addIndex = function (combination, index) {
  return { ...combination, index }
}
