import { isPlainObject } from '../../../../../utils/main.js'

// Validate `file.variables`
export const validateVariables = function(variables) {
  if (!isPlainObject(variables)) {
    throw new TypeError(`'variables' must be an object`)
  }

  Object.entries(variables).forEach(([name, value]) =>
    validateVariable(name, value),
  )
}

const validateVariable = function(name, value) {
  if (!VARIABLE_NAME_REGEXP.test(name)) {
    throw new TypeError(
      `'variables' '${name}' name must only contain letters, digits or - _`,
    )
  }

  if (typeof value !== 'string') {
    throw new TypeError(`'variables' '${name}' must be a string`)
  }
}

const VARIABLE_NAME_REGEXP = /^[\w_-]+$/u
