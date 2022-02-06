import { inspect } from 'util'

import isPlainObj from 'is-plain-obj'

import { TasksSyntaxError } from '../../../common/error.js'
import { validateTasks } from '../../../common/validate/file.js'
import {
  validateBoolean,
  validateFunction,
} from '../../../common/validate/type.js'

// Validate that the tasks file has correct shape
export const validate = function (tasks) {
  return validateTasks({ tasks, validators, normalizeTask })
}

const validators = {
  beforeAll: validateFunction,
  beforeEach: validateFunction,
  main: validateFunction,
  afterEach: validateFunction,
  afterAll: validateFunction,
  async: validateBoolean,
}

// Tasks can be directly a function, which is a shortcut for `{ main }`
const normalizeTask = function (task) {
  if (typeof task === 'function') {
    return { main: task }
  }

  if (!isPlainObj(task)) {
    throw new TasksSyntaxError(
      `should be a function or an object not: ${inspect(task)}`,
    )
  }

  return task
}
