import { isPlainObject } from '../../../../../utils/main.js'

import { validateVariables } from './variables.js'
import { validateTasks } from './tasks.js'
import { validateVariations } from './variation.js'

// Validate that tasks and variations have correct shape
export const validateTaskFile = function(entries) {
  if (!isPlainObject(entries)) {
    throw new TypeError(`Tasks must be a top-level object`)
  }

  if (entries.tasks === undefined) {
    throw new TypeError(`Missing property 'tasks'`)
  }

  Object.entries(entries).forEach(validateEntry)
}

const validateEntry = function([name, entry]) {
  const validator = VALIDATORS[name]

  if (validator === undefined) {
    throw new TypeError(`Unknown property '${name}'`)
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
  tasks: validateTasks,
}
