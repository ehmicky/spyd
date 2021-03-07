import findUp from 'find-up'
import { isFile } from 'path-type'

import { UserError } from '../error/main.js'

// Retrieve the tasks file path.
// Uses either the `tasks` or `runner{id}.tasks` configuration properties.
// Can also use the default `...[/benchmark]/tasks.*`.
// Also validate that the file exists.
export const getTaskPath = async function ({
  runnerConfig: { tasks },
  runnerExtensions,
  cwd,
}) {
  if (tasks !== undefined) {
    return await getUserTaskPath(tasks)
  }

  const defaultTaskPath = await getDefaultTaskPath(cwd, runnerExtensions)

  if (defaultTaskPath === undefined) {
    throw new UserError('No tasks file could be found.')
  }

  return defaultTaskPath
}

const getUserTaskPath = async function (tasks) {
  if (!(await isFile(tasks))) {
    throw new UserError(`Tasks file does not exist: ${tasks}`)
  }

  return tasks
}

// By default, we find the first `benchmark/tasks.*`.
// The file extensions depends on the `runner.extensions`.
const getDefaultTaskPath = async function (cwd, runnerExtensions) {
  const defaultTasks = runnerExtensions.flatMap(getDefaultTaskPathByExt)
  return await findUp(defaultTasks, { cwd })
}

const getDefaultTaskPathByExt = function (runnerExtension) {
  return DEFAULT_TASKS.map((defaultTask) => `${defaultTask}${runnerExtension}`)
}

// Allowing `tasks.*` in a `benchmark` directory is useful for grouping
// benchmark-related files.
// Allowing `tasks.*` to be in the current directory is useful for on-the-fly
// benchmarking.
const DEFAULT_TASKS = ['./benchmark/tasks.', './tasks.']
