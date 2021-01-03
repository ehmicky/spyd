import { checkObject, normalizeOptionalArray } from '../config/check.js'
import { UserError } from '../error/main.js'

// Validate `tasks`
export const checkTasks = function (tasks) {
  checkObject(tasks, 'tasks')
}

export const normalizeTaskPatterns = function (patterns, key) {
  return normalizeOptionalArray(patterns, `tasks.${key}`)
}

export const checkEmptyTasks = function (tasks) {
  if (tasks === undefined) {
    throw new UserError(`Please specify a "tasks" configuration property.`)
  }

  if (Object.keys(tasks).length === 0) {
    throw new UserError(`The "tasks" configuration property must not be empty.`)
  }
}
