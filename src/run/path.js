import findUp from 'find-up'
import { isFile } from 'path-type'

import { UserError } from '../error/main.js'

// Retrieve the tasks file path.
// Uses either the `tasks` or `runner{id}.tasks` configuration properties.
// Can also use the default `.../benchmark/tasks.*`.
// Also validate that the file exists.
export const getTaskPath = async function ({
  tasks,
  runnerConfig: { tasks: taskPath = tasks },
  runnerExtensions,
  cwd,
}) {
  if (taskPath !== undefined) {
    return await getUserTaskPath(taskPath)
  }

  const defaultTaskPath = await getDefaultTaskPath(cwd, runnerExtensions)

  if (defaultTaskPath === undefined) {
    throw new UserError('No tasks file could be found.')
  }

  return defaultTaskPath
}

const getUserTaskPath = async function (taskPath) {
  if (!(await isFile(taskPath))) {
    throw new UserError(`Tasks file does not exist: ${taskPath}`)
  }

  return taskPath
}

// By default, we find the first `benchmark/tasks.*`.
// The file extensions depends on the `runner.extensions`.
const getDefaultTaskPath = async function (cwd, runnerExtensions) {
  const defaultTasks = runnerExtensions.map(
    (runnerExtension) => `${DEFAULT_TASKS}${runnerExtension}`,
  )
  return await findUp(defaultTasks, { cwd })
}

const DEFAULT_TASKS = './benchmark/tasks.'
