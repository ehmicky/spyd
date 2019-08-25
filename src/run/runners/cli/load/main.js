import { loadFile } from './file.js'
import { validateTaskFile } from './validate/main.js'
import { getInitialVariables, getVariables } from './variables.js'
import { getShell } from './shell.js'
import { normalizeTasks } from './normalize.js'
import { addTasksVariations } from './variations.js'

// Load the iterations using the 'load' event sent by parent
// Those iterations are used:
//   - to run benchmarks
//   - by the parent at startup, but only iterations ids and titles are needed
// Load the task file using its absolute path
export const loadTaskFile = async function(taskPath, stdio) {
  const entries = await loadFile(taskPath)
  validateTaskFile(entries, taskPath)

  const variables = getInitialVariables()
  const { shell, entries: entriesA } = getShell(entries, variables)
  const { variables: variablesA, entries: entriesB } = await getVariables({
    entries: entriesA,
    variables,
    shell,
    stdio,
  })

  const { tasks, variations } = normalizeTasks({
    entries: entriesB,
    taskPath,
    variables: variablesA,
  })
  const iterations = addTasksVariations({ tasks, variations, variables })
  return { iterations, shell }
}
