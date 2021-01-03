import { UserError } from '../error/main.js'

// Retrieve the absolute paths to the tasks files using the `files` and
// `cwd` configuration properties
export const getTasks = function (files) {
  const taskPathsA = taskPaths.flat()

  if (taskPathsA.length === 0) {
    throw new UserError('No tasks file found')
  }

  const taskPathsB = [...new Set(taskPathsA)]
  return taskPathsB
}
