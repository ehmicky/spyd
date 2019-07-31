import { resolve } from 'path'

import locatePath from 'locate-path'

// Retrieve the path to the task file using the `file` and `cwd` options
export const getTaskPath = async function(file, cwd) {
  const taskFile = await getTaskFile(file, cwd)

  if (taskFile === undefined) {
    throw new Error('No tasks file found')
  }

  const taskPath = resolve(cwd, taskFile)
  return taskPath
}

const getTaskFile = async function(file, cwd) {
  if (file !== undefined) {
    return file
  }

  const taskFile = await locatePath(DEFAULT_TASK_PATHS, { cwd })
  return taskFile
}

const DEFAULT_TASK_PATHS = [
  'benchmarks.js',
  'benchmarks/main.js',
  'benchmarks.ts',
  'benchmarks/main.ts',
]
