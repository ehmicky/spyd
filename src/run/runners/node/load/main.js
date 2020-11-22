import { UserError } from '../../../../error/main.js'

import { addTasksInputs } from './inputs.js'
import { normalizeTasks } from './normalize.js'
import { useRequireOpt } from './require_opt.js'
import { validateFile } from './validate.js'

// Load the combinations using the 'load' event sent by parent
// Those are used:
//   - to measure combinations
//   - by the parent at startup, but only combination ids and titles are needed
// Load the tasks file using its absolute path
export const loadTasksFile = async function (
  taskPath,
  { require: requireOpt },
) {
  await useRequireOpt(requireOpt, taskPath)

  const entries = await loadFile(taskPath)
  validateFile(entries)

  const { tasks, inputs } = normalizeTasks(entries)
  const combinations = addTasksInputs(tasks, inputs)
  return combinations
}

const loadFile = async function (taskPath) {
  try {
    return await import(taskPath)
  } catch (error) {
    throw new UserError(`Could not load the tasks file\n\n${error.stack}`)
  }
}
