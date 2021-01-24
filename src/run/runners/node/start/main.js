import { UserError } from '../../../../error/main.js'
import { importJsFile } from '../../../../utils/import.js'

import { getCalibrations } from './calibrate.js'
import { addDefaults } from './default.js'
import { useRequireConfig } from './require_config.js'
import { validate } from './validate.js'

// Start the combinations by requiring the task files.
export const start = async function ({
  runnerConfig: { require: requireConfig },
  taskPath,
  taskId,
  inputs,
  calibrate,
}) {
  await useRequireConfig(requireConfig)

  const tasks = importFile(taskPath)
  const tasksA = validate(tasks)
  const tasksB = addDefaults(tasksA)
  const task = taskId === undefined ? {} : tasksB[taskId]

  const tasksC = Object.keys(tasksB)
  const calibrations = getCalibrations(calibrate)
  return { tasks: tasksC, task, taskArg: inputs, calibrations }
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
