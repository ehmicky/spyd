import { UserError } from '../../../../error/main.js'
import { importJsFile } from '../../../../utils/import.js'

import { getCalibrations } from './calibrate.js'
import { normalizeTasks } from './normalize.js'
import { useRequireConfig } from './require_config.js'
import { validateFile } from './validate.js'

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
  validateFile(tasks)
  const tasksA = normalizeTasks(tasks)
  const task = taskId === undefined ? {} : tasksA[taskId]

  const tasksB = Object.keys(tasksA)
  const calibrations = getCalibrations(calibrate)
  return { tasks: tasksB, task, taskArg: inputs, calibrations }
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
