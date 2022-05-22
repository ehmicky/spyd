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
