import { isPlainObject } from '../../../../../utils/main.js'

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
  if (name === 'shell') {
    return validateShell(entry, taskPath)
  }

  if (name === 'variations') {
    return validateVariations(entry, taskPath)
  }

  validateTask(name, entry, taskPath)
}

const validateShell = function(shell, taskPath) {
  if (typeof shell !== 'boolean') {
    throw new TypeError(`'shell' in '${taskPath}' must be a boolean`)
  }
}
