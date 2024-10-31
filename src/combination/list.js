import { UserError } from '../error/main.js'
import { selectCombinations } from '../select/main.js'
import { mapKeys, mapValues } from '../utils/map.js'

import { validateCombinationsIds } from './ids/validate.js'
import { toInputsList } from './inputs.js'
import { addPrefix } from './prefix.js'
import { listTasks } from './tasks/main.js'

// Retrieve each combination, i.e. combination of each combination dimension
// of a new `run` or `dev`.
export const listCombinations = async ({
  runner: runners,
  inputs,
  system,
  cwd,
  select,
}) => {
  const tasks = await listTasks(runners, cwd)
  const inputsList = toInputsList(inputs)

  const combinations = getCombinationsProduct(tasks, inputsList, system)
  validateCombinationsIds(combinations, inputsList)
  const combinationsA = selectCombinations(combinations, select)
  return combinationsA
}

// Get cartesian product of all combinations.
// `taskPath` is not set in `dimensions.task.path` because it used by the `init`
// stage before task dimension ids are known.
const getCombinationsProduct = (tasks, inputsList, system) => {
  if (tasks.length === 0) {
    throw new UserError(`Please specify some "tasks".`)
  }

  const systemDimensions = getSystemDimensions(system)
  return tasks.map(({ id, taskPath, runner: { versions, ...runner } }) => ({
    dimensions: { task: { id }, runner, ...systemDimensions },
    taskPath,
    inputsList,
    stats: {},
    versions,
  }))
}

const getSystemDimensions = (system) => {
  const systemDimensions = mapValues(system, getSystemDimension)
  return mapKeys(systemDimensions, prefixSystemDimension)
}

const getSystemDimension = (id) => ({ id })

const prefixSystemDimension = (propName) => addPrefix(propName, 'system')
