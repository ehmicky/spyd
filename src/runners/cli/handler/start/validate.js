import { inspect } from 'node:util'

import isPlainObj from 'is-plain-obj'

import { TasksSyntaxError } from '../../../common/error.js'
import { validateTasks } from '../../../common/validate/file.js'
import { validateString } from '../../../common/validate/type.js'

// Validate that tasks file has correct shape
export const validate = function (tasks) {
  return validateTasks({ tasks, validators, normalizeTask })
}

const validators = {
  beforeAll: validateString,
  beforeEach: validateString,
  main: validateString,
  afterEach: validateString,
  afterAll: validateString,
}

// Tasks can be directly a string, which is a shortcut for `{ main }`
const normalizeTask = function (task) {
  if (typeof task === 'string') {
    return { main: task }
  }

  if (!isPlainObj(task)) {
    throw new TasksSyntaxError(
      `should be a string or an object not: ${inspect(task)}`,
    )
  }

  return task
}
