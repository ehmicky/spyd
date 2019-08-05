import { isPlainObject } from '../../../utils/main.js'

import {
  validateProp,
  validateFunction,
  validateString,
  validateStringArray,
} from './common.js'

// Validate that tasks have correct shape
export const validateTask = function(taskId, task, taskPath) {
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
    validateProp({
      id: taskId,
      validators: VALIDATE_TASK,
      category: 'task',
      taskPath,
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
