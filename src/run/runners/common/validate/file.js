import isPlainObj from 'is-plain-obj'

import { UserError } from '../../../../error/main.js'

// Validate that the tasks file has correct shape
export const validateTasksFile = function (entries, validators) {
  if (!isPlainObj(entries)) {
    throw new UserError(`Tasks file must be a top-level object`)
  }

  if (entries.tasks === undefined) {
    throw new UserError(`Missing property 'tasks'`)
  }

  Object.entries(entries).forEach(([name, entry]) => {
    validateEntry(name, entry, validators)
  })
}

const validateEntry = function (name, entry, validators) {
  const validator = validators[name]

  if (validator === undefined) {
    throw new UserError(`Unknown property '${name}'`)
  }

  validator(entry)
}
