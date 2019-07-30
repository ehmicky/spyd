import { resolve } from 'path'

import locatePath from 'locate-path'

export const getTasks = async function({ tasks, file, cwd }) {
  if (tasks !== undefined) {
    return tasks
  }

  const taskPath = await getTaskFile(file, cwd)

  if (taskPath === undefined) {
    throw new TypeError('No tasks file found')
  }

  const tasksA = loadTaskFile(taskPath)
  return tasksA
}

const getTaskFile = async function(file, cwd) {
  if (file !== undefined) {
    return file
  }

  const taskFile = await locatePath(DEFAULT_TASK_PATHS, { cwd })
  const taskPath = resolve(cwd, taskFile)
  return taskPath
}

const DEFAULT_TASK_PATHS = [
  'benchmarks.js',
  'benchmarks/index.js',
  'benchmarks/main.js',
  'benchmarks.ts',
  'benchmarks/index.ts',
  'benchmarks/main.ts',
]

const loadTaskFile = function(taskPath) {
  // TODO: replace with `import()` once it is supported by default by ESLint
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const tasks = require(taskPath)
  const tasksA = normalizeTasks(tasks)
  return tasksA
}

const normalizeTasks = function(tasks) {
  return Object.entries(tasks).map(normalizeTask)
}

const normalizeTask = function([name, task]) {
  if (typeof task === 'function') {
    return { name, main: task }
  }

  return { name, ...task }
}
