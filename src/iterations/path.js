import { resolve } from 'path'

import fastGlob from 'fast-glob'

// Retrieve the absolute paths to the benchmark files using the `files` and
// `cwd` options
export const getTaskPaths = async function(files, cwd) {
  const taskPaths = await Promise.all(
    files.map(pattern => applyGlobbing(pattern, cwd)),
  )
  const taskPathsA = taskPaths.flat()

  if (taskPathsA.length === 0) {
    throw new Error('No benchmark file found')
  }

  const taskPathsB = [...new Set(taskPathsA)]
  return taskPathsB
}

const applyGlobbing = async function(pattern, cwd) {
  const files = await fastGlob(pattern, { cwd })
  const filesA = files.map(file => resolve(cwd, file))
  return filesA
}
