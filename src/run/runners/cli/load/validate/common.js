// Common validation utility when validating both tasks and variations
export const validateProp = function({
  id,
  validators,
  category,
  taskPath,
  propName,
  prop,
}) {
  const validator = validators[propName]

  if (validator === undefined) {
    const validProps = Object.keys(validators).join(', ')
    throw new TypeError(
      `Invalid property '${propName}' of ${category} '${id}' in '${taskPath}'. Must be one of: ${validProps}`,
    )
  }

  const message = validator(prop)

  if (message !== undefined) {
    throw new TypeError(
      `Property '${propName}' of ${category} '${id}' in '${taskPath}' ${message}`,
    )
  }
}

export const validateString = function(prop) {
  if (!isValidString(prop)) {
    return 'must be a non-empty string'
  }
}

export const validateStringArray = function(prop) {
  if (!Array.isArray(prop) || !prop.every(isValidString)) {
    return 'must be an array of non-empty strings'
  }
}

const isValidString = function(prop) {
  return typeof prop === 'string' && prop.trim() !== ''
}

export const validatePrimitive = function(prop) {
  if (
    !isValidString(prop) &&
    typeof prop !== 'number' &&
    typeof prop !== 'boolean'
  ) {
    return 'must be a non-empty string, a number or a boolean'
  }
}
