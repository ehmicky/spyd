import { isPlainObject } from '../utils/main.js'

// Validate that tasks have correct shape
export const validateTasks = function(tasks, taskPath) {
  if (!isPlainObject(tasks)) {
    throw new TypeError(`Tasks must use named exports in '${taskPath}'`)
  }

  if (tasks.default !== undefined) {
    throw new TypeError(
      `Tasks must use named exports not default exports in '${taskPath}'`,
    )
  }

  Object.entries(tasks).forEach(([taskId, task]) =>
    validateTask(taskId, task, taskPath),
  )
}

const validateTask = function(taskId, task, taskPath) {
  if (typeof task === 'function') {
    return
  }

  if (!isPlainObject(task)) {
    throw new TypeError(
      `Task '${taskId}' in '${taskPath}' must be either a function or an object`,
    )
  }

  if (task.main === undefined) {
    throw new TypeError(
      `Task '${taskId} in '${taskPath}' must have a 'main' function`,
    )
  }

  Object.entries(task).forEach(([propName, prop]) =>
    validateProp({ taskId, taskPath, propName, prop }),
  )
}

const validateProp = function({ taskId, taskPath, propName, prop }) {
  const validator = VALIDATORS[propName]

  if (validator === undefined) {
    const validProps = Object.keys(VALIDATORS).join(', ')
    throw new TypeError(
      `Invalid property '${propName}' of task '${taskId}' in '${taskPath}'. Must be one of: ${validProps}`,
    )
  }

  const message = validator(prop)

  if (message !== undefined) {
    throw new TypeError(
      `Property '${propName}' of task '${taskId}' in '${taskPath}' ${message}`,
    )
  }
}

const validateFunction = function(prop) {
  if (typeof prop !== 'function') {
    return 'must be a function'
  }
}

const validateString = function(prop) {
  if (typeof prop !== 'string' || prop.trim() === '') {
    return 'must be a non-empty string'
  }
}

const validateObject = function(prop) {
  if (!isPlainObject(prop)) {
    return 'must be a plain object'
  }
}

const VALIDATORS = {
  main: validateFunction,
  before: validateFunction,
  after: validateFunction,
  title: validateString,
  parameters: validateObject,
}
