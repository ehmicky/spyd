import { listTasks } from '../run/list.js'
import { loadRunners } from '../run/load.js'
import { selectCombinations } from '../select/main.js'

import { fromInputsObj } from './inputs.js'
import { validateCombinationsIds } from './validate_ids.js'

// Retrieve each combination, i.e. combination of each combination category
export const getCombinations = async function ({
  runners,
  inputs,
  systemId,
  select,
  cwd,
}) {
  const { runners: runnersA, systemVersions } = await loadRunners(runners, cwd)
  const tasksA = await listTasks(runnersA, cwd)
  const inputsA = fromInputsObj(inputs)

  const combinations = getCombinationsProduct({
    tasks: tasksA,
    inputs: inputsA,
    systemId,
  })
  validateCombinationsIds(combinations, inputsA)

  const combinationsA = selectCombinations(combinations, select)
  return { combinations: combinationsA, systemVersions }
}

// Get cartesian product of all combinations
const getCombinationsProduct = function ({ tasks, inputs, systemId }) {
  return tasks.map(
    ({
      taskPath,
      taskId,
      runnerId,
      runnerSpawn,
      runnerSpawnOptions,
      runnerConfig,
    }) => ({
      taskPath,
      taskId,
      runnerId,
      runnerSpawn,
      runnerSpawnOptions,
      runnerConfig,
      inputs,
      systemId,
      stats: {},
    }),
  )
}
