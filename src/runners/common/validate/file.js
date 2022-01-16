import { inspect } from 'util'

import isPlainObj from 'is-plain-obj'

import { UserError } from '../../../error/main.js'
import { mapValues } from '../../../utils/map.js'

// Validate that the tasks file has correct shape
export const validateTasks = function ({ tasks, validators, normalizeTask }) {
  if (!isPlainObj(tasks)) {
    throw new UserError(
      `Tasks file should export an object not: ${inspect(tasks)}`,
    )
  }

  return mapValues(tasks, (task, taskId) =>
    validateTask({ taskId, task, validators, normalizeTask }),
  )
}

const validateTask = function ({ taskId, task, validators, normalizeTask }) {
  try {
    return eValidateTask({ task, validators, normalizeTask })
  } catch (error) {
    error.message = `Task "${taskId}" ${error.message}`
    throw error
  }
}

const eValidateTask = function ({ task, validators, normalizeTask }) {
  const taskA = normalizeTask(task)

  validateRequiredMain(taskA)

  Object.entries(taskA).forEach(([propName, prop]) => {
    validateProp({ validators, propName, prop })
  })

  return taskA
}

const validateRequiredMain = function ({ main }) {
  if (main === undefined) {
    throw new UserError(`must have a "main" property`)
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
