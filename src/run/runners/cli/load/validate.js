import isPlainObj from 'is-plain-obj'

import { UserError } from '../../../../error/main.js'
import { validateBenchmarkFile } from '../../common/validate/file.js'
import { validateInputs } from '../../common/validate/inputs.js'
import { validateTasks } from '../../common/validate/tasks.js'
import {
  validateString,
  validateStringArray,
  validatePrimitive,
} from '../../common/validate/type.js'

// Validate that benchmark file has correct shape
export const validateFile = function (entries) {
  validateBenchmarkFile(entries, VALIDATORS)
}

const validateShell = function (shell) {
  if (typeof shell !== 'boolean' && typeof shell !== 'string') {
    throw new UserError(`'shell' must be a boolean or a string`)
  }
}

// Validate `file.variables`
const validateVariables = function (variables) {
  if (!isPlainObj(variables)) {
    throw new UserError(`'variables' must be an object`)
  }

  Object.entries(variables).forEach(validateVariable)
}

const validateVariable = function ([name, value]) {
  if (!VARIABLE_NAME_REGEXP.test(name)) {
    throw new UserError(
      `'variables' '${name}' name must only contain letters, digits or - _`,
    )
  }

  if (typeof value !== 'string' || value.trim() === '') {
    throw new UserError(`'variables' '${name}' must be a non-empty string`)
  }
}

const VARIABLE_NAME_REGEXP = /^[\w_-]+$/u

const TASK_VALIDATORS = {
  id: validateString,
  title: validateString,
  main: validateString,
  before: validateString,
  after: validateString,
  inputs: validateStringArray,
}

const INPUT_VALIDATORS = {
  id: validateString,
  title: validateString,
  value: validatePrimitive,
}

const VALIDATORS = {
  shell: validateShell,
  variables: validateVariables,
  tasks: validateTasks.bind(undefined, TASK_VALIDATORS),
  inputs: validateInputs.bind(undefined, INPUT_VALIDATORS),
}
