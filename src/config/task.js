import { basename } from 'path'

import fastGlob from 'fast-glob'
import { not as notJunk } from 'junk'

import { checkTasks } from './check.js'

// `tasks` use globbing instead of file paths. Also, it is an object and the
// values are arrays.
export const resolveTasks = async function ({ tasks, ...config }, cwd) {
  if (tasks === undefined) {
    return config
  }

  checkTasks(tasks, 'tasks')

  const tasksA = await Promise.all(
    Object.entries(tasks).map(([key, patterns]) =>
      resolveGlobPatterns(patterns, key, cwd),
    ),
  )
  const tasksB = Object.assign({}, ...tasksA)
  return { ...config, tasks: tasksB }
}

const resolveGlobPatterns = async function (patterns, key, cwd) {
  const filePaths = await fastGlob(patterns, { cwd, absolute: true })
  const filePathsA = filePaths.filter(isNormalFile)
  return { [key]: filePathsA }
}

// Remove backup and temporary files
const isNormalFile = function (filePath) {
  return notJunk(basename(filePath))
}
