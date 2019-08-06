import { sendParentMessage, getParentMessage } from '../../../processes/ipc.js'

import { useRequireOpt } from './require_opt.js'
import { validateTaskFile } from './validate/main.js'
import { normalizeTasks } from './normalize.js'
import { addTasksVariations } from './variations.js'

// Load the task file using its absolute path
export const load = async function() {
  const { taskPath, requireOpt } = await getParentMessage('load')

  const iterations = await loadTaskFile(taskPath, requireOpt)

  const loadEvent = getLoadEvent(iterations)

  await sendParentMessage('load', loadEvent)

  return iterations
}

const loadTaskFile = async function(taskPath, requireOpt) {
  useRequireOpt(requireOpt, taskPath)

  const entries = await loadFile(taskPath)
  validateTaskFile(entries, taskPath)

  const { tasks, variations } = normalizeTasks(entries, taskPath)
  const iterations = addTasksVariations(tasks, variations)
  return iterations
}

const loadFile = function(taskPath) {
  try {
    // TODO: replace with `import()` once it is supported by default by ESLint
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(taskPath)
  } catch (error) {
    throw new Error(
      `Could not load the task file '${taskPath}'\n\n${error.stack}`,
    )
  }
}

const getLoadEvent = function(iterations) {
  const iterationsA = iterations.map(getIteration)
  return { iterations: iterationsA }
}

const getIteration = function({
  taskId,
  taskTitle,
  variationId,
  variationTitle,
}) {
  return { taskId, taskTitle, variationId, variationTitle }
}
