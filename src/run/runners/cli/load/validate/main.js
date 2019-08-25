import { isPlainObject } from '../../../../../utils/main.js'

import { validateVariables } from './variables.js'
import { validateTask } from './task.js'
import { validateVariations } from './variation.js'

// Validate that tasks and variations have correct shape
export const validateTaskFile = function(entries) {
  if (!isPlainObject(entries)) {
    throw new TypeError(`Tasks must be a top-level object`)
  }

  Object.entries(entries).forEach(validateEntry)
}

const validateEntry = function([name, entry]) {
  const validator = VALIDATORS[name]

  if (validator === undefined) {
    validateTask(name, entry)
    return
  }

  validator(entry)
}

const validateShell = function(shell) {
  if (typeof shell !== 'boolean' && typeof shell !== 'string') {
    throw new TypeError(`'shell' must be a boolean or a string`)
  }
}

const VALIDATORS = {
  shell: validateShell,
  variables: validateVariables,
  variations: validateVariations,
}
