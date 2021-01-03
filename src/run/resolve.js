import { basename } from 'path'

import fastGlob from 'fast-glob'
import { not as notJunk } from 'junk'

import { checkObject, checkOptionalStringArray } from '../config/check.js'
import { UserError } from '../error/main.js'

// `tasks` use globbing instead of file paths. Also, it is an object and the
// values are arrays.
export const resolveTasks = async function ({ tasks, ...config }, cwd) {
  if (tasks === undefined) {
    return config
  }

  checkObject(tasks, 'tasks')

  const tasksA = await Promise.all(
    Object.entries(tasks).map(([key, patterns]) =>
      normalizeTaskPatterns(patterns, key, cwd),
    ),
  )
  const tasksB = Object.assign({}, ...tasksA)
  return { ...config, tasks: tasksB }
}

const normalizeTaskPatterns = async function (patterns, key, cwd) {
  if (hasNoPatterns(patterns)) {
    return { [key]: patterns }
  }

  checkOptionalStringArray(patterns, 'tasks')

  const filePaths = await fastGlob(patterns, { cwd, absolute: true })
  const filePathsA = filePaths.filter(isNormalFile)

  validateHasPatterns(filePaths, patterns, key)

  return { [key]: filePathsA }
}

const hasNoPatterns = function (patterns) {
  return patterns === undefined || patterns === null || isEmptyArray(patterns)
}

const isEmptyArray = function (patterns) {
  return Array.isArray(patterns) && patterns.length === 0
}

// Remove backup and temporary files
const isNormalFile = function (filePath) {
  return notJunk(basename(filePath))
}

const validateHasPatterns = function (filePaths, patterns, key) {
  if (filePaths.length !== 0) {
    return
  }

  const patternsStr = Array.isArray(patterns) ? patterns.join(' or ') : patterns
  throw new UserError(
    `Could not find any "${key}" task files matching the globbing pattern: ${patternsStr}`,
  )
}
