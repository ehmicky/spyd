import { isPlainObject } from '../../../../../utils/main.js'
import {
  validateString,
  validateStringArray,
  validatePrimitive,
} from '../../../common/validate.js'
import { validateTasks } from '../../../common/tasks.js'
import { validateVariations } from '../../../common/variations.js'

import { validateVariables } from './variables.js'

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

const TASK_VALIDATORS = {
  id: validateString,
  title: validateString,
  main: validateString,
  before: validateString,
  after: validateString,
  variations: validateStringArray,
}

const VARIATION_VALIDATORS = {
  id: validateString,
  title: validateString,
  value: validatePrimitive,
}

const VALIDATORS = {
  shell: validateShell,
  variables: validateVariables,
  tasks: validateTasks.bind(null, TASK_VALIDATORS),
  variations: validateVariations.bind(null, VARIATION_VALIDATORS),
}
