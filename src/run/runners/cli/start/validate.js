import isPlainObj from 'is-plain-obj'

import { UserError } from '../../../../error/main.js'
import { validateTasks } from '../../common/validate/file.js'
import { validateString } from '../../common/validate/type.js'

import { validateShell } from './shell.js'

// Validate that tasks file and options have correct shape
export const validate = function (tasks, shell) {
  validateShell(shell)
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
    throw new UserError(`should be a string or an object not: ${task}`)
  }

  return task
}
