import { loadYamlFile } from '../../../../utils/yaml.js'
import { TasksLoadError } from '../../../common/error.js'

import { getEnv } from './env.js'
import { validate } from './validate.js'

// Import the tasks file
export const start = async (
  state,
  { runnerConfig: { shell = 'none' }, taskPath, taskId, inputs },
) => {
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
const importFile = async (taskPath) => {
  try {
    return await loadYamlFile(taskPath)
  } catch (cause) {
    throw new TasksLoadError('', { cause })
  }
}

// Revert any state created by `start`
// eslint-disable-next-line no-empty-function
export const end = () => {}
