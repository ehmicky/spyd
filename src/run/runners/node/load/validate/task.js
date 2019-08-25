import { isPlainObject } from '../../../../../utils/main.js'

import {
  validateProp,
  validateFunction,
  validateString,
  validateStringArray,
} from './common.js'

// Validate that tasks have correct shape
export const validateTask = function(taskId, task) {
  if (!isPlainObject(task)) {
    throw new TypeError(`Task '${taskId}' must be an object`)
  }

  if (task.main === undefined) {
    throw new TypeError(`Task '${taskId} must have a 'main' function`)
  }

  Object.entries(task).forEach(([propName, prop]) =>
    validateProp({
      id: taskId,
      validators: VALIDATE_TASK,
      category: 'task',
      propName,
      prop,
    }),
  )
}

const VALIDATE_TASK = {
  main: validateFunction,
  before: validateFunction,
  after: validateFunction,
  title: validateString,
  variations: validateStringArray,
}
