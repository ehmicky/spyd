import isPlainObj from 'is-plain-obj'

import { UserError } from '../../../../error/main.js'

import { validateProp } from './helpers.js'

// Validate that tasks have correct shape
export const validateTasks = function (validators, tasks) {
  if (!Array.isArray(tasks)) {
    throw new UserError(`Tasks must be an array`)
  }

  tasks.forEach((task) => {
    validateTask(task, validators)
  })
}

const validateTask = function (task, validators) {
  if (!isPlainObj(task)) {
    throw new UserError(`Task '${task}' must be an object`)
  }

  const { id, main } = task

  if (id === undefined) {
    throw new UserError(`All tasks must have an 'id' property`)
  }

  if (main === undefined) {
    throw new UserError(`Task '${id}' must have a 'main' property`)
  }

  Object.entries(task).forEach(([propName, prop]) => {
    validateProp({ id, validators, category: 'task', propName, prop })
  })
}
