import { normalizePath } from 'wild-wild-parser'

// Normalize string definition
export const normalizeString = (definition) => {
  if (typeof definition !== 'string') {
    throw new TypeError('must be a string.')
  }

  return definition.trim()
}

// Normalize boolean definition
export const normalizeBoolean = (definition) => {
  if (typeof definition !== 'boolean') {
    throw new TypeError('must be a boolean.')
  }

  return definition
}

// Normalize property path definition
export const normalizePropertyPath = (definition) => {
  try {
    return normalizePath(definition)
  } catch (error) {
    throw new Error(`must be a valid path:\n${error.message}`)
  }
}

// Validate input is a non-empty string
export const validateDefinedString = (value) => {
  validateString(value)
  validateNonEmptyString(value)
}

const validateString = (value) => {
  if (typeof value !== 'string') {
    throw new TypeError('must be a string.')
  }
}

const validateNonEmptyString = (value) => {
  if (typeof value === 'string' && value.trim() === '') {
    throw new Error('must not be an empty string.')
  }
}
