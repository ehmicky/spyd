import { useRequireOpt } from './require_opt.js'
import { validateTasks } from './validate.js'
import { normalizeTasks } from './normalize.js'

// Load the task file using its absolute path
export const loadTaskFile = async function({ taskPath, requireOpt }) {
  useRequireOpt(requireOpt, taskPath)
  const tasks = await loadFile(taskPath)
  validateTasks(tasks, taskPath)
  const tasksA = normalizeTasks(tasks)
  return tasksA
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
