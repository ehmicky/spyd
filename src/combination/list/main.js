import { UserError } from '../../error/main.js'
import { selectCombinations } from '../../select/main.js'
import { toInputsList } from '../inputs.js'
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
  const inputsList = toInputsList(inputs)

  const combinations = getCombinationsProduct({
    tasks,
    inputsList,
    systemId,
  })
  validateCombinationsIds(combinations, inputsList)

  const combinationsA = selectCombinations(combinations, select)
  return combinationsA
}

// Get cartesian product of all combinations
// `taskPath` is not set in `dimensions.task.path` because it used by the `init`
// stage before task dimension ids are known.
const getCombinationsProduct = function ({ tasks, inputsList, systemId }) {
  if (tasks.length === 0) {
    throw new UserError(`Please specify some "tasks".`)
  }

  return tasks.map(({ id, taskPath, runner }) => ({
    dimensions: { task: { id }, runner, system: { id: systemId } },
    taskPath,
    inputsList,
    stats: {},
  }))
}
