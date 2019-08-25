import { getVariables } from '../template.js'

import { loadFile } from './file.js'
import { validateTaskFile } from './validate/main.js'
import { normalizeTasks } from './normalize.js'
import { addTasksVariations } from './variations.js'

// Load the iterations using the 'load' event sent by parent
// Those iterations are used:
//   - to run benchmarks
//   - by the parent at startup, but only iterations ids and titles are needed
// Load the task file using its absolute path
export const loadTaskFile = async function(taskPath) {
  const entries = await loadFile(taskPath)
  validateTaskFile(entries, taskPath)

  const { variables, entries: entriesA } = getVariables(entries)

  const { tasks, variations, shell } = normalizeTasks({
    entries: entriesA,
    taskPath,
    variables,
  })
  const iterations = addTasksVariations({ tasks, variations, variables })
  return { iterations, shell }
}
