import { normalizePath } from 'wild-wild-parser'

import { wrapError } from '../../../../../error/wrap.js'

// Normalize string definition
export const normalizeString = function (definition) {
  if (typeof definition !== 'string') {
    throw new TypeError('must be a string.')
  }

  return definition.trim()
}

// Normalize boolean definition
export const normalizeBoolean = function (definition) {
  if (typeof definition !== 'boolean') {
    throw new TypeError('must be a boolean.')
  }

  return definition
}

// Normalize property path definition
export const normalizePropertyPath = function (definition) {
  try {
    return normalizePath(definition)
  } catch (error) {
    throw wrapError(error, 'must be a valid path:')
  }
}
