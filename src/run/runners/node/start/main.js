import { UserError } from '../../../../error/main.js'

import { bindInput } from './inputs.js'
import { normalizeTask } from './normalize.js'
import { useRequireConfig } from './require_config.js'
import { validateFile } from './validate.js'

// Start the combinations by requiring the task files.
export const start = async function ({
  runConfig: { require: requireConfig },
  taskPath,
  input,
}) {
  await useRequireConfig(requireConfig, taskPath)

  const task = importFile(taskPath)
  validateFile(task)

  const taskA = normalizeTask(task)
  const { main, beforeEach, afterEach, async } = bindInput(taskA, input)
  return { main, beforeEach, afterEach, async }
}

const importFile = function (taskPath) {
  try {
    // eslint-disable-next-line node/global-require, import/no-dynamic-require
    return require(taskPath)
  } catch (error) {
    throw new UserError(
      `Could not import the tasks file ${taskPath}\n${error.stack}`,
    )
  }
}
