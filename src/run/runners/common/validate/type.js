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
