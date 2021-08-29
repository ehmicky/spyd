import { UserError } from '../error/main.js'
import { selectCombinations } from '../select/main.js'
import { listTasks } from '../tasks/list.js'
import { loadRunners } from '../tasks/load.js'

import { fromInputsObj } from './inputs.js'
import { validateCombinationsIds } from './validate_ids.js'

// Retrieve each combination, i.e. combination of each combination dimension
export const listCombinations = async function ({
  runners,
  inputs,
  systemId,
  select,
  cwd,
}) {
  const runnersA = await loadRunners(runners)
  const tasksA = await listTasks(runnersA, cwd)
  const inputsA = fromInputsObj(inputs)

  const combinations = getCombinationsProduct({
    tasks: tasksA,
    inputs: inputsA,
    systemId,
  })
  validateCombinationsIds(combinations, inputsA)

  const combinationsA = selectCombinations(combinations, select)
  return combinationsA
}

// Get cartesian product of all combinations
const getCombinationsProduct = function ({ tasks, inputs, systemId }) {
  if (tasks.length === 0) {
    throw new UserError(`Please specify some "tasks".`)
  }

  return tasks.map(
    ({
      taskPath,
      taskId,
      runnerId,
      runnerSpawn,
      runnerSpawnOptions,
      runnerVersions,
      runnerConfig,
    }) => ({
      taskPath,
      taskId,
      runnerId,
      runnerSpawn,
      runnerSpawnOptions,
      runnerVersions,
      runnerConfig,
      inputs,
      systemId,
      stats: {},
    }),
  )
}
