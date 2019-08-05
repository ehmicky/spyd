import { resolve } from 'path'

import locatePath from 'locate-path'

// Retrieve the absolute paths to the task files using the `files` and `cwd`
// options
export const getTaskPaths = async function(files, cwd) {
  const filesA = await getDefaultFiles(files, cwd)
  const taskPaths = filesA.map(file => resolve(cwd, file))
  const taskPathsA = [...new Set(taskPaths)]
  return taskPathsA
}

// `files` option defaults to looking up files in the current directory
const getDefaultFiles = async function(files, cwd) {
  if (files.length !== 0) {
    return files
  }

  const defaultFiles = await locatePath(DEFAULT_FILES, { cwd })

  if (defaultFiles === undefined) {
    throw new Error('No tasks file found')
  }

  return [defaultFiles]
}

const DEFAULT_FILES = [
  'benchmarks.js',
  'benchmarks/main.js',
  'benchmarks.ts',
  'benchmarks/main.ts',
]
