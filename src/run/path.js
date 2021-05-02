import findUp from 'find-up'
import { isFile } from 'path-type'

import { UserError } from '../error/main.js'

// Retrieve the tasks file path.
// Uses either the `tasks` or `runner{id}.tasks` configuration properties.
// Can also use the default `...[/benchmark]/tasks.*`.
// Also validate that the file exists.
// There is no "fast mode" without tasks files. The fastest mode is to create
// a tasks file in `cwd` then run `spyd`
//  - This ensures the correct file extension is used which is important due to:
//     - syntax highlighting and IDE features
//     - runner might handle different file extensions differently
//       (e.g. *.ts transpiling)
//  - We do not provide inline `conf.[runnerRUNNER.]inline[.TASK[.STEP]]` "BODY"
//    since this would:
//     - Not allow defining content outside function body (e.g. imports) nor
//       function declaration (e.g. async keyword)
//        - This would be even more of a problem with some languages that use
//          more top-level declarations
//     - Encourage sharing tasks by sharing command lines, instead of using
//       shareable modules
//     - Require entering long statements on command line, which is not
//       ergonomic: no syntax highlighting, linting, autocompletion, etc.
//     - Be harder to specify file extension
//  - We do no provide `conf.tasks` "temp", creating a temp file on user behalf
//    since it would require either:
//     - Opening editor in a new tab|window, which is hard to do cross-platform
//     - Using same tab for both edit and benchmark, resulting in a poor
//       experience
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
