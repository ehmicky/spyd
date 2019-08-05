import { useRequireOpt } from './require_opt.js'
import { validateTaskFile } from './validate/main.js'
import { normalizeEntries } from './normalize.js'

// Load the task file using its absolute path
export const loadTaskFile = async function({ taskPath, requireOpt }) {
  useRequireOpt(requireOpt, taskPath)
  const entries = await loadFile(taskPath)
  validateTaskFile(entries, taskPath)
  const tasks = normalizeEntries({ entries, taskPath })
  return tasks
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
