import { UserError } from '../../../../error/main.js'

import { bindInput } from './inputs.js'
import { normalizeTask } from './normalize.js'
import { useRequireConfig } from './require_config.js'
import { validateFile } from './validate.js'

// Load the combinations using the 'load' event sent by parent
// Those are used:
//   - to measure combinations
//   - by the parent at startup, but only combination ids and titles are needed
// Load the tasks file using its absolute path
export const load = async function ({
  runConfig: { require: requireConfig },
  taskPath,
  taskId,
  input,
}) {
  await useRequireConfig(requireConfig, taskPath)

  const task = loadFile(taskPath)
  validateFile(task, taskId)

  const taskA = normalizeTask(task)
  const { main, before, after, async } = bindInput(taskA, input)
  return { main, before, after, async }
}

const loadFile = function (taskPath) {
  try {
    // eslint-disable-next-line node/global-require, import/no-dynamic-require
    return require(taskPath)
  } catch (error) {
    throw new UserError(
      `Could not load the tasks file ${taskPath}\n${error.stack}`,
    )
  }
}
