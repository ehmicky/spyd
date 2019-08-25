import { isPlainObject } from '../../../../../utils/main.js'
import {
  validateProp,
  validateString,
  validateStringArray,
} from '../../../common/validate.js'

// Validate that tasks have correct shape
export const validateTasks = function(tasks) {
  if (!Array.isArray(tasks)) {
    throw new TypeError(`Tasks must be an array`)
  }

  tasks.forEach(validateTask)
}

export const validateTask = function(task) {
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
  main: validateString,
  before: validateString,
  after: validateString,
  variations: validateStringArray,
}
