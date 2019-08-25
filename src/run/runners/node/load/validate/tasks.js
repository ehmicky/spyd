import { isPlainObject } from '../../../../../utils/main.js'

import {
  validateProp,
  validateFunction,
  validateString,
  validateStringArray,
} from './common.js'

// Validate that tasks have correct shape
export const validateTasks = function(tasks) {
  if (!Array.isArray(tasks)) {
    throw new TypeError(`Tasks must be an array`)
  }

  tasks.forEach(validateTask)
}

const validateTask = function(task) {
  if (!isPlainObject(task)) {
    throw new TypeError(`Task '${task}' must be an object`)
  }

  const { id, main } = task

  if (id === undefined) {
    throw new TypeError(`All tasks must have an 'id' property`)
  }

  if (main === undefined) {
    throw new TypeError(`Task '${id}' must have a 'main' property`)
  }

  Object.entries(task).forEach(([propName, prop]) =>
    validateProp({
      id,
      validators: VALIDATE_TASK,
      category: 'task',
      propName,
      prop,
    }),
  )
}

const VALIDATE_TASK = {
  id: validateString,
  title: validateString,
  main: validateFunction,
  before: validateFunction,
  after: validateFunction,
  variations: validateStringArray,
}
