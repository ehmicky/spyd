import { isPlainObject } from '../../../../../utils/main.js'

import { validateProp, validateString, validateStringArray } from './common.js'

// Validate that tasks have correct shape
export const validateTask = function(taskId, task, taskPath) {
  if (!isPlainObject(task)) {
    throw new TypeError(`Task '${taskId}' in '${taskPath}' must be an object`)
  }

  if (task.main === undefined) {
    throw new TypeError(
      `Task '${taskId} in '${taskPath}' must have a 'main' property`,
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
  main: validateString,
  before: validateString,
  after: validateString,
  title: validateString,
  variations: validateStringArray,
}
