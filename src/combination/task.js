import { basename } from 'path'

import { UserError } from '../error/main.js'

// Normalize all tasks into a single array, combining task paths, ids and runner
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
const getTaskId = function (taskPath) {
  return basename(taskPath).replace(TASK_ID_REGEXP, '')
}

const TASK_ID_REGEXP = /\..*/u
