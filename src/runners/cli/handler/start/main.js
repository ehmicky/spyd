import { UserError } from '../../../../error/main.js'
import { wrapError } from '../../../../error/wrap.js'
import { loadYamlFile } from '../../../../utils/yaml.js'

import { getEnv } from './env.js'
import { validate } from './validate.js'

// Import the tasks file
export const start = async function (
  state,
  { runnerConfig: { shell = 'none' }, taskPath, taskId, inputs },
) {
  const tasks = await importFile(taskPath)
  const tasksA = validate(tasks)
  const task = taskId === undefined ? {} : tasksA[taskId]
  const env = getEnv(inputs)
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(state, { task, env, shell })

  const tasksB = Object.keys(tasksA)
  return { tasks: tasksB }
}

// We use a YAML file (as opposed to JSON) because:
//  - It has no escaping issues with most of shell syntax such as double quotes
//  - It allows comments
const importFile = async function (taskPath) {
  try {
    return await loadYamlFile(taskPath)
  } catch (error) {
    throw wrapError(
      error,
      `Could not import the tasks file '${taskPath}\n`,
      UserError,
    )
  }
}

// Revert any state created by `start`
// eslint-disable-next-line no-empty-function
export const end = function () {}
