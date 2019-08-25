import { validateBenchmarkFile } from '../../../common/validate/main.js'
import {
  validateString,
  validateStringArray,
  validatePrimitive,
} from '../../../common/validate.js'
import { validateTasks } from '../../../common/tasks.js'
import { validateVariations } from '../../../common/variations.js'

import { validateVariables } from './variables.js'

// Validate that benchmark file has correct shape
export const validateFile = function(entries) {
  validateBenchmarkFile(entries, VALIDATORS)
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
