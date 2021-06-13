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

  const tasks = await importFile(taskPath)
  const tasksA = convertESM(tasks)
  const tasksB = validate(tasksA)
  const tasksC = addDefaults(tasksB)
  const task = taskId === undefined ? {} : tasksC[taskId]
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(state, { task, inputs })

  const tasksD = Object.keys(tasksC)
  return { tasks: tasksD }
}

const importFile = async function (taskPath) {
  try {
    return await importJsFile(taskPath)
  } catch (error) {
    throw new UserError(
      `Could not import the tasks file ${taskPath}\n${error.stack}`,
    )
  }
}

// ES modules named imports are not plain objects, but module objects.
// This converts them to plain objects.
const convertESM = function (tasks) {
  return tasks[Symbol.toStringTag] === 'Module' ? { ...tasks } : tasks
}

// Revert any state created by `start`
// eslint-disable-next-line no-empty-function
export const end = function () {}
