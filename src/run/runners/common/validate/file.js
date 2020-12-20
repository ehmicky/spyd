import isPlainObj from 'is-plain-obj'

import { UserError } from '../../../../error/main.js'

// Validate that the task file has correct shape
export const validateTask = function (task, validators) {
  if (!isPlainObj(task)) {
    throw new UserError(`Task '${task}' must be an object`)
  }

  const { id, main } = task

  if (main === undefined) {
    throw new UserError(`Task '${id}' must have a 'main' property`)
  }

  Object.entries(task).forEach(([propName, prop]) => {
    validateProp({ id, validators, propName, prop })
  })
}

// Common validation utility when validating both tasks and inputs
const validateProp = function ({ id, validators, propName, prop }) {
  const validator = validators[propName]

  if (validator === undefined) {
    const validProps = Object.keys(validators).join(', ')
    throw new UserError(
      `Invalid property '${propName}' of task '${id}'. Must be one of: ${validProps}`,
    )
  }

  const message = validator(prop)

  if (message !== undefined) {
    throw new UserError(`Property '${propName}' of task '${id}' ${message}`)
  }
}
