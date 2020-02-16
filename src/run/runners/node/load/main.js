import { useRequireOpt } from './require_opt.js'
import { validateFile } from './validate.js'
import { normalizeTasks } from './normalize.js'
import { addTasksVariations } from './variations.js'

// Load the iterations using the 'load' event sent by parent
// Those iterations are used:
//   - to run benchmarks
//   - by the parent at startup, but only iterations ids and titles are needed
// Load the benchmark file using its absolute path
export const loadBenchmarkFile = async function(
  taskPath,
  { require: requireOpt },
) {
  await useRequireOpt(requireOpt, taskPath)

  const entries = await loadFile(taskPath)
  validateFile(entries)

  const { tasks, variations } = normalizeTasks(entries)
  const iterations = addTasksVariations(tasks, variations)
  return iterations
}

const loadFile = async function(taskPath) {
  try {
    return await import(taskPath)
  } catch (error) {
    throw new Error(`Could not load the benchmark file\n\n${error.stack}`)
  }
}
