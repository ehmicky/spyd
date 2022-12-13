import { inspect } from 'node:util'

import isPlainObj from 'is-plain-obj'

import { mapValues } from '../../../utils/map.js'
import { BaseError, TasksSyntaxError } from '../error.js'

// Validate that the tasks file has correct shape
export const validateTasks = ({ tasks, validators, normalizeTask }) => {
  if (!isPlainObj(tasks)) {
    throw new TasksSyntaxError(
      `Tasks file should export an object not: ${inspect(tasks)}`,
    )
  }

  return mapValues(tasks, (task, taskId) =>
    validateTask({ taskId, task, validators, normalizeTask }),
  )
}

const validateTask = ({ taskId, task, validators, normalizeTask }) => {
  try {
    return eValidateTask({ task, validators, normalizeTask })
  } catch (cause) {
    throw new BaseError(`Task "${taskId}":`, { cause })
  }
}

const eValidateTask = ({ task, validators, normalizeTask }) => {
  const taskA = normalizeTask(task)

  validateRequiredMain(taskA)

  Object.entries(taskA).forEach(([propName, prop]) => {
    validateProp({ validators, propName, prop })
  })

  return taskA
}

const validateRequiredMain = ({ main }) => {
  if (main === undefined) {
    throw new TasksSyntaxError(`must have a "main" property`)
  }
}

const validateProp = ({ validators, propName, prop }) => {
  const validator = validators[propName]

  if (validator === undefined) {
    const validProps = Object.keys(validators).join(', ')
    throw new TasksSyntaxError(
      `property "${propName}" must be one of: ${validProps}`,
    )
  }

  const message = validator(prop)

  if (message !== undefined) {
    throw new TasksSyntaxError(`property "${propName}" ${message}`)
  }
}
