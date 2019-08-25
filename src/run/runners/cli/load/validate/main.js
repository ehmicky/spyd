import { isPlainObject } from '../../../../../utils/main.js'
import { validateString, validatePrimitive } from '../../../common/validate.js'
import { validateVariations } from '../../../common/variations.js'

import { validateVariables } from './variables.js'
import { validateTasks } from './tasks.js'

// Validate that benchmark file has correct shape
export const validateBenchmarkFile = function(entries) {
  if (!isPlainObject(entries)) {
    throw new TypeError(`Benchmark file must be a top-level object`)
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

const VARIATION_VALIDATORS = {
  id: validateString,
  title: validateString,
  value: validatePrimitive,
}

const VALIDATORS = {
  shell: validateShell,
  variables: validateVariables,
  tasks: validateTasks,
  variations: validateVariations.bind(null, VARIATION_VALIDATORS),
}
