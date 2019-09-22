import isPlainObj from 'is-plain-obj'

import {
  validateBenchmarkFile,
  validateString,
  validateStringArray,
  validatePrimitive,
  validateTasks,
  validateVariations,
} from '../../common/validate/main.js'

// Validate that benchmark file has correct shape
export const validateFile = function(entries) {
  validateBenchmarkFile(entries, VALIDATORS)
}

const validateShell = function(shell) {
  if (typeof shell !== 'boolean' && typeof shell !== 'string') {
    throw new TypeError(`'shell' must be a boolean or a string`)
  }
}

// Validate `file.variables`
const validateVariables = function(variables) {
  if (!isPlainObj(variables)) {
    throw new TypeError(`'variables' must be an object`)
  }

  Object.entries(variables).forEach(validateVariable)
}

const validateVariable = function([name, value]) {
  if (!VARIABLE_NAME_REGEXP.test(name)) {
    throw new TypeError(
      `'variables' '${name}' name must only contain letters, digits or - _`,
    )
  }

  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`'variables' '${name}' must be a non-empty string`)
  }
}

const VARIABLE_NAME_REGEXP = /^[\w_-]+$/u

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
