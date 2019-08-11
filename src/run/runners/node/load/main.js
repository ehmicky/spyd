import { useRequireOpt } from './require_opt.js'
import { validateTaskFile } from './validate/main.js'
import { normalizeTasks } from './normalize.js'
import { addTasksVariations } from './variations.js'

// Load the iterations using the 'load' event sent by parent
// Those iterations are used:
//   - to run benchmarks
//   - by the parent at startup, but only iterations ids and titles are needed
// Load the task file using its absolute path
export const loadTaskFile = async function(taskPath, { require: requireOpt }) {
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
