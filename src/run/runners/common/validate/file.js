import isPlainObj from 'is-plain-obj'

import { UserError } from '../../../../error/main.js'

// Validate that the tasks file has correct shape
export const validateTasks = function ({ tasks, validators, requiredProps }) {
  if (!isPlainObj(tasks)) {
    throw new UserError(`Tasks file should export an object not: ${tasks}`)
  }

  Object.entries(tasks).forEach(([taskId, task]) => {
    validateTask({ taskId, task, validators, requiredProps })
  })
}

const validateTask = function ({ taskId, task, validators, requiredProps }) {
  try {
    eValidateTask({ task, validators, requiredProps })
  } catch (error) {
    error.message = `Task "${taskId}" ${error.message}`
    throw error
  }
}

const eValidateTask = function ({ task, validators, requiredProps }) {
  if (typeof task === 'function') {
    return
  }

  if (!isPlainObj(task)) {
    throw new UserError(`should be a function or an object not: ${task}`)
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
    throw new UserError(`must have a '${requiredProp}' property`)
  }
}

const validateProp = function ({ validators, propName, prop }) {
  const validator = validators[propName]

  if (validator === undefined) {
    const validProps = Object.keys(validators).join(', ')
    throw new UserError(`property "${propName}" must be one of: ${validProps}`)
  }

  const message = validator(prop)

  if (message !== undefined) {
    throw new UserError(`property "${propName}" ${message}`)
  }
}
