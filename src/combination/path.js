import { resolve } from 'path'

import fastGlob from 'fast-glob'

import { UserError } from '../error/main.js'

// Retrieve the absolute paths to the tasks files using the `files` and
// `cwd` options
export const getTaskPaths = async function (files, cwd) {
  const taskPaths = await Promise.all(
    files.map((pattern) => applyGlobbing(pattern, cwd)),
  )
  const taskPathsA = taskPaths.flat()

  if (taskPathsA.length === 0) {
    throw new UserError('No tasks file found')
  }

  const taskPathsB = [...new Set(taskPathsA)]
  return taskPathsB
}

const applyGlobbing = async function (pattern, cwd) {
  const files = await fastGlob(pattern, { cwd })
  const filesA = files.map((file) => resolve(cwd, file))
  return filesA
}
