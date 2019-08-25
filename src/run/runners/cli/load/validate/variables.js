import { isPlainObject } from '../../../../../utils/main.js'

// Validate `file.variables`
export const validateVariables = function(variables, taskPath) {
  if (!isPlainObject(variables)) {
    throw new TypeError(`'variables' in '${taskPath}' must be an object`)
  }

  Object.entries(variables).forEach(([name, value]) =>
    validateVariable(name, value, taskPath),
  )
}

const validateVariable = function(name, value, taskPath) {
  if (!VARIABLE_NAME_REGEXP.test(name)) {
    throw new TypeError(
      `'variables' '${name}' in '${taskPath}' name must only contain letters, digits or - _`,
    )
  }

  if (typeof value !== 'string') {
    throw new TypeError(
      `'variables' '${name}' in '${taskPath}' must be a string`,
    )
  }
}

const VARIABLE_NAME_REGEXP = /^[\w_-]+$/u
