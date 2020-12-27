import { env } from 'process'

import { UserError } from '../../../../error/main.js'
import { loadYamlFile } from '../../../../utils/yaml.js'

import { addTasksInputs } from './inputs.js'
import { normalizeTasks } from './normalize.js'
import { getShell } from './shell.js'
import { validateFile } from './validate.js'
import { getVariables } from './variables.js'

// Import the tasks file
export const startTask = async function (taskPath) {
  const entries = await importFile(taskPath)
  validateFile(entries)

  const variables = env
  const { shell, entries: entriesA } = getShell(entries, variables)
  const { variables: variablesA, entries: entriesB } = await getVariables({
    entries: entriesA,
    variables,
    shell,
  })

  const { tasks, inputs } = normalizeTasks(entriesB, variablesA)
  const combinations = addTasksInputs({
    tasks,
    inputs,
    variables: variablesA,
  })
  return { combinations, shell }
}

const importFile = async function (taskPath) {
  try {
    return await loadYamlFile(taskPath)
  } catch (error) {
    throw new UserError(
      `Could not import tasks file '${taskPath}': ${error.message}`,
    )
  }
}
