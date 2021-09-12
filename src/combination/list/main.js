import { UserError } from '../../error/main.js'
import { selectCombinations } from '../../select/main.js'
import { fromInputsObj } from '../inputs.js'
import { listTasks } from '../tasks/main.js'

import { validateCombinationsIds } from './validate_ids.js'

// Retrieve each combination, i.e. combination of each combination dimension
export const listCombinations = async function ({
  runners,
  inputs,
  systemId,
  select,
  cwd,
}) {
  const tasks = await listTasks(runners, cwd)
  const inputsA = fromInputsObj(inputs)

  const combinations = getCombinationsProduct({
    tasks,
    inputs: inputsA,
    systemId,
  })
  validateCombinationsIds(combinations, inputsA)

  const combinationsA = selectCombinations(combinations, select)
  return combinationsA
}

// Get cartesian product of all combinations
// `taskPath` is not set in `dimensions.task.path` because it used by the `init`
// stage before task dimension ids are known.
const getCombinationsProduct = function ({ tasks, inputs, systemId }) {
  if (tasks.length === 0) {
    throw new UserError(`Please specify some "tasks".`)
  }

  return tasks.map(({ id, taskPath, runner }) => ({
    dimensions: { task: { id }, runner, system: { id: systemId } },
    taskPath,
    inputs,
    stats: {},
  }))
}
