// Normalize string definition
export const normalizeString = function (definition) {
  if (typeof definition !== 'string') {
    throw new TypeError('Definition must be a string.')
  }

  return definition.trim()
}

// Normalize boolean definition
export const normalizeBoolean = function (definition) {
  if (typeof definition !== 'boolean') {
    throw new TypeError('Definition must be a boolean.')
  }

  return definition
}
