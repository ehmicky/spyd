import { UserError } from '../../../../error/main.js'

// Common validation utility when validating both tasks and inputs
export const validateProp = function ({
  id,
  validators,
  category,
  propName,
  prop,
}) {
  const validator = validators[propName]

  if (validator === undefined) {
    const validProps = Object.keys(validators).join(', ')
    throw new UserError(
      `Invalid property '${propName}' of ${category} '${id}'. Must be one of: ${validProps}`,
    )
  }

  const message = validator(prop)

  if (message !== undefined) {
    throw new UserError(
      `Property '${propName}' of ${category} '${id}' ${message}`,
    )
  }
}
