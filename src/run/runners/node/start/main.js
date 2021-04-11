import { UserError } from '../../../../error/main.js'
import { importJsFile } from '../../../../utils/import.js'

import { addDefaults } from './default.js'
import { useRequireConfig } from './require_config.js'
import { validate } from './validate.js'

// Start the combinations by requiring the task files.
export const start = async function (
  state,
  { runnerConfig: { require: requireConfig }, taskPath, taskId, inputs },
) {
  await useRequireConfig(requireConfig)

  const tasks = importFile(taskPath)
  const tasksA = validate(tasks)
  const tasksB = addDefaults(tasksA)
  const task = taskId === undefined ? {} : tasksB[taskId]
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(state, { task, taskArg: inputs })

  const tasksC = Object.keys(tasksB)
  return { tasks: tasksC }
}

const importFile = function (taskPath) {
  try {
    return importJsFile(taskPath)
  } catch (error) {
    throw new UserError(
      `Could not import the tasks file ${taskPath}\n${error.stack}`,
    )
  }
}

// Revert any state created by `start`
// eslint-disable-next-line no-empty-function
export const end = function () {}
