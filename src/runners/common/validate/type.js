export const validateFunction = (prop) => {
  if (typeof prop !== 'function') {
    return 'must be a function'
  }
}

export const validateBoolean = (prop) => {
  if (typeof prop !== 'boolean') {
    return 'must be a boolean'
  }
}

export const validateString = (prop) => {
  if (typeof prop !== 'string' || prop.trim() === '') {
    return 'must be a non-empty string'
  }
}
