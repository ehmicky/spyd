import { basename } from 'path'

import { UserError } from '../error/main.js'

// Normalize all tasks into a single array, combining task paths, ids and runner
// Tasks are selected using the `tasks.{runnerId}` property with an array of
// globbing patterns.
// This allows selecting both tasks and runners, since only runners with some
// tasks are used.
// This format is simple, explicit, yet allows both multiple tasks per runner
// and multiple runners per task.
// Other solutions to specify the runner of each task have problems:
//  - using code comment:
//     - this requires reading files, which is slow with big files
//     - transpiling might remove code comments
//     - this does not work in compiled binaries
//  - using the task filenames:
//     - this does not allow multiple runners per task
//     - this leads to odd filenames when the runner and file extension are
//       similar or the same
//  - looking into `package.json` or `node_modules` for all the installed
//    runners
//     - too implicit/magic
//     - this might give false positives, especially due to nested dependencies
//     - this does not work well with bundled runners
// In principle, `tasks.{runnerId}` is similar to properties like `reporters`,
// `progresses` and `stores` but for runners. Specifying both runners and task
// files at the same time gives a simpler syntax.
export const getTasks = function (tasks) {
  const tasksA = Object.entries(tasks).flatMap(getRunnerTasks)

  if (tasksA.length === 0) {
    throw new UserError('No tasks files were specified or found.')
  }

  return tasksA
}

const getRunnerTasks = function ([runnerId, taskPaths]) {
  return taskPaths.map((taskPath) => getRunnerTask({ taskPath, runnerId }))
}

const getRunnerTask = function ({ taskPath, runnerId }) {
  const taskId = getTaskId(taskPath)
  return { taskId, taskPath, runnerId }
}

// The task id is the filename excluding any file extension.
// If several dots are present in the filename, they are all considered part of
// the file extension.
// We do this to:
//  - be able to retrieve task ids statically in a way that's user-friendly
//  - allow two different task files with the same id but different runners
const getTaskId = function (taskPath) {
  return basename(taskPath).replace(TASK_ID_REGEXP, '')
}

const TASK_ID_REGEXP = /\..*/u
