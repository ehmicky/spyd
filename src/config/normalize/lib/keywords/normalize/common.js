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

// Validate input is a non-empty string
export const validateDefinedString = function (value) {
  validateString(value)
  validateNonEmptyString(value)
}

const validateString = function (value) {
  if (typeof value !== 'string') {
    throw new TypeError('must be a string.')
  }
}

const validateNonEmptyString = function (value) {
  if (typeof value === 'string' && value.trim() === '') {
    throw new Error('must not be an empty string.')
  }
}