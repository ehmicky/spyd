import { UserError } from '../../../../error/main.js'
import { importJsFile } from '../../../../utils/import.js'

import { getEmptyMeasures } from './empty.js'
import { normalizeTask } from './normalize.js'
import { useRequireConfig } from './require_config.js'
import { validateFile } from './validate.js'

// Start the combinations by requiring the task files.
export const start = async function ({
  runnerConfig: { require: requireConfig },
  taskPath,
  inputs,
  emptyLength,
}) {
  await useRequireConfig(requireConfig)

  const task = importFile(taskPath)
  validateFile(task)

  const taskA = normalizeTask(task)
  const emptyMeasures = getEmptyMeasures(emptyLength)
  return { task: taskA, taskArg: inputs, emptyMeasures }
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
