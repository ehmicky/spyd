import { UserError } from '../../../../error/main.js'
import { loadYamlFile } from '../../../../utils/yaml.js'

import { getEnv } from './env.js'
import { validate } from './validate.js'

// Import the tasks file
export const start = async function ({
  runnerConfig: { shell = 'none' },
  taskPath,
  taskId,
  inputs,
}) {
  const tasks = await importFile(taskPath)
  const tasksA = validate(tasks)
  const task = taskId === undefined ? {} : tasksA[taskId]

  const tasksB = Object.keys(tasksA)
  const env = getEnv(inputs)
  return { tasks: tasksB, task, env, shell }
}

const importFile = async function (taskPath) {
  try {
    return await loadYamlFile(taskPath)
  } catch (error) {
    throw new UserError(
      `Could not import the tasks file '${taskPath}\n${error.message}`,
    )
  }
}
