export const validateFunction = function (prop) {
  if (typeof prop !== 'function') {
    return 'must be a function'
  }
}

export const validateBoolean = function (prop) {
  if (typeof prop !== 'boolean') {
    return 'must be a boolean'
  }
}

export const validateString = function (prop) {
  if (!isValidString(prop)) {
    return 'must be a non-empty string'
  }
}

export const validateStringArray = function (prop) {
  if (!Array.isArray(prop) || !prop.every(isValidString)) {
    return 'must be an array of non-empty strings'
  }
}

const isValidString = function (prop) {
  return typeof prop === 'string' && prop.trim() !== ''
}

export const validatePrimitive = function (prop) {
  if (
    !isValidString(prop) &&
    typeof prop !== 'number' &&
    typeof prop !== 'boolean'
  ) {
    return 'must be a non-empty string, a number or a boolean'
  }
}
