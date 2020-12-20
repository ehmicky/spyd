import isPlainObj from 'is-plain-obj'

import { UserError } from '../../../../error/main.js'

// Validate that the task file has correct shape
export const validateTask = function ({
  task,
  taskId,
  validators,
  requiredProps,
}) {
  if (!isPlainObj(task)) {
    throw new UserError(`Task '${task}' must be an object`)
  }

  validateRequiredProps(task, taskId, requiredProps)

  Object.entries(task).forEach(([propName, prop]) => {
    validateProp({ taskId, validators, propName, prop })
  })
}

const validateRequiredProps = function (task, taskId, requiredProps) {
  requiredProps.forEach((requiredProp) => {
    validateRequiredProp(task, taskId, requiredProp)
  })
}

const validateRequiredProp = function (task, taskId, requiredProp) {
  if (task[requiredProp] === undefined) {
    throw new UserError(
      `Task '${taskId}' must have a '${requiredProp}' property`,
    )
  }
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
