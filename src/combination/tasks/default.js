import { basename } from 'path'

import { isNotJunk } from 'junk'

import { lookupFiles } from '../../config/lookup.js'
import { DEFAULT_TASKS_BASE } from '../../config/normalize/path.js'

// Apply default value for `tasks`. Applied on each runner.
// This only applies when `tasks` is `undefined`
// An empty array resolves to no files instead
//  - This can be useful in programmatic usage
//  - This is only useful when using several runners. If all runners have no
//    tasks, the run will fail.
export const applyDefaultTasks = async function ({ config }) {
  const { tasks = await resolveDefaultTasks() } = config
  return tasks
}

const resolveDefaultTasks = async function () {
  return await lookupFiles(isTaskPath, DEFAULT_TASKS_BASE)
}

const isTaskPath = function (filePath) {
  const filename = basename(filePath)
  return filename.startsWith(TASKS_BASENAME) && isNotJunk(filename)
}

const TASKS_BASENAME = 'tasks.'
