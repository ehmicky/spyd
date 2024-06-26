import { importJsNamed } from '../../../../utils/import.js'
import { TasksLoadError } from '../../../common/error.js'

import { addDefaults } from './default.js'
import { useRequireConfig } from './require_config.js'
import { validate } from './validate.js'

// Start the combinations by requiring the task files.
export const start = async (
  state,
  { runnerConfig: { require: requireConfig }, taskPath, taskId, inputs },
) => {
  await useRequireConfig(requireConfig)

  const tasks = await importFile(taskPath)
  const tasksA = validate(tasks)
  const tasksB = addDefaults(tasksA)
  const task = taskId === undefined ? {} : tasksB[taskId]
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(state, { task, inputs })

  const tasksC = Object.keys(tasksB)
  return { tasks: tasksC }
}

const importFile = async (taskPath) => {
  try {
    return await importJsNamed(taskPath)
  } catch (cause) {
    throw new TasksLoadError('Could not import the tasks file.', { cause })
  }
}

// Revert any state created by `start`
// eslint-disable-next-line no-empty-function
export const end = () => {}
