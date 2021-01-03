import { basename } from 'path'

import fastGlob from 'fast-glob'
import { not as notJunk } from 'junk'

import { UserError } from '../error/main.js'

import { checkTasks, normalizeTaskPatterns } from './check.js'

// `tasks` use globbing instead of file paths. Also, it is an object and the
// values are arrays.
export const resolveTasks = async function ({ tasks, ...config }, cwd) {
  if (tasks === undefined) {
    return config
  }

  checkTasks(tasks)

  const tasksA = await Promise.all(
    Object.entries(tasks).map(([key, patterns]) =>
      normalizePatterns(patterns, key, cwd),
    ),
  )
  const tasksB = Object.assign({}, ...tasksA)
  return { ...config, tasks: tasksB }
}

const normalizePatterns = async function (patterns, key, cwd) {
  if (hasNoPatterns(patterns)) {
    return { [key]: patterns }
  }

  const patternsA = normalizeTaskPatterns(patterns, key)

  const filePaths = await fastGlob(patternsA, { cwd, absolute: true })
  const filePathsA = filePaths.filter(isNormalFile)

  validateHasPatterns(filePaths, patternsA, key)

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

  const patternsStr = patterns.join(' or ')
  throw new UserError(
    `Could not find any "${key}" task files matching the globbing pattern: ${patternsStr}`,
  )
}
