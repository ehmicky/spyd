export const validateBoolean = function (value) {
  if (typeof value !== 'boolean') {
    throw new TypeError('must be true or false.')
  }
}

export const validateInteger = function (value) {
  if (!Number.isInteger(value)) {
    throw new TypeError('must be an integer.')
  }
}

export const validateNumberString = function (value) {
  if (typeof value !== 'string' && !Number.isFinite(value)) {
    throw new TypeError('must be a string or a number.')
  }

  validateNonEmptyString(value)
}

export const validateDefinedString = function (value) {
  validateString(value)
  validateNonEmptyString(value)
}

const validateNonEmptyString = function (value) {
  if (typeof value === 'string' && value.trim() === '') {
    throw new Error('must not be an empty string.')
  }
}

export const validateString = function (value) {
  if (typeof value !== 'string') {
    throw new TypeError('must be a string.')
  }
}
