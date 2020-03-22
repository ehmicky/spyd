import isPlainObj from 'is-plain-obj'

import { validateProp } from './helpers.js'

// Validate that tasks have correct shape
export const validateTasks = function (validators, tasks) {
  if (!Array.isArray(tasks)) {
    throw new TypeError(`Tasks must be an array`)
  }

  tasks.forEach((task) => validateTask(task, validators))
}

const validateTask = function (task, validators) {
  if (!isPlainObj(task)) {
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
    validateProp({ id, validators, category: 'task', propName, prop }),
  )
}
