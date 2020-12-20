import isPlainObj from 'is-plain-obj'

import { UserError } from '../../../../error/main.js'

// Validate that the task file has correct shape
export const validateTask = function (task, taskId, validators) {
  if (!isPlainObj(task)) {
    throw new UserError(`Task '${task}' must be an object`)
  }

  if (task.main === undefined) {
    throw new UserError(`Task '${taskId}' must have a 'main' property`)
  }

  Object.entries(task).forEach(([propName, prop]) => {
    validateProp({ taskId, validators, propName, prop })
  })
}

const validateProp = function ({ taskId, validators, propName, prop }) {
  const validator = validators[propName]

  if (validator === undefined) {
    const validProps = Object.keys(validators).join(', ')
    throw new UserError(
      `Invalid property '${propName}' of task '${taskId}'. Must be one of: ${validProps}`,
    )
  }

  const message = validator(prop)

  if (message !== undefined) {
    throw new UserError(`Property '${propName}' of task '${taskId}' ${message}`)
  }
}
