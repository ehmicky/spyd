import isPlainObj from 'is-plain-obj'

import { UserError } from '../../../../error/main.js'
import { validateTask } from '../../common/validate/file.js'
import { validateString } from '../../common/validate/type.js'

// Validate that tasks file has correct shape
export const validateFile = function (task) {
  validateTask({ task, validators, requiredProps })
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

const validators = {
  beforeEach: validateString,
  afterEach: validateString,
  main: validateString,
  shell: validateShell,
  variables: validateVariables,
}
const requiredProps = ['main']
