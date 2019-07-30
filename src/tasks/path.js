import { resolve } from 'path'

import locatePath from 'locate-path'

export const getTaskPath = async function({ file, cwd }) {
  const taskFile = await getTaskFile(file, cwd)

  if (taskFile === undefined) {
    throw new TypeError('No tasks file found')
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
  'benchmarks/index.js',
  'benchmarks/main.js',
  'benchmarks.ts',
  'benchmarks/index.ts',
  'benchmarks/main.ts',
]
