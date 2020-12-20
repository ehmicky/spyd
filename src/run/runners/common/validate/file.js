import isPlainObj from 'is-plain-obj'

import { UserError } from '../../../../error/main.js'

// Validate that the task file has correct shape
export const validateTask = function ({ task, validators, requiredProps }) {
  if (!isPlainObj(task)) {
    throw new UserError(`Task '${task}' must be an object`)
  }

  validateRequiredProps(task, requiredProps)

  Object.entries(task).forEach(([propName, prop]) => {
    validateProp({ validators, propName, prop })
  })
}

const validateRequiredProps = function (task, requiredProps) {
  requiredProps.forEach((requiredProp) => {
    validateRequiredProp(task, requiredProp)
  })
}

const validateRequiredProp = function (task, requiredProp) {
  if (task[requiredProp] === undefined) {
    throw new UserError(`Task must have a '${requiredProp}' property`)
  }
}

const validateProp = function ({ validators, propName, prop }) {
  const validator = validators[propName]

  if (validator === undefined) {
    const validProps = Object.keys(validators).join(', ')
    throw new UserError(
      `Invalid task property '${propName}'. Must be one of: ${validProps}`,
    )
  }

  const message = validator(prop)

  if (message !== undefined) {
    throw new UserError(`Task property '${propName}' ${message}`)
  }
}
