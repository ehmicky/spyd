import { isPlainObject } from '../../../../../utils/main.js'

import { validateVariables } from './variables.js'
import { validateTask } from './task.js'
import { validateVariations } from './variation.js'

// Validate that tasks and variations have correct shape
export const validateTaskFile = function(entries, taskPath) {
  if (!isPlainObject(entries)) {
    throw new TypeError(`Tasks must be a top-level object in '${taskPath}'`)
  }

  Object.entries(entries).forEach(([name, entry]) =>
    validateEntry(name, entry, taskPath),
  )
}

const validateEntry = function(name, entry, taskPath) {
  const validator = VALIDATORS[name]

  if (validator === undefined) {
    validateTask(name, entry, taskPath)
    return
  }

  validator(entry, taskPath)
}

const validateShell = function(shell, taskPath) {
  if (typeof shell !== 'boolean' && typeof shell !== 'string') {
    throw new TypeError(
      `'shell' in '${taskPath}' must be a boolean or a string`,
    )
  }
}

const VALIDATORS = {
  shell: validateShell,
  variables: validateVariables,
  variations: validateVariations,
}
