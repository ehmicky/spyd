import { resolve } from 'path'

import locatePath from 'locate-path'

export const getIterations = async function(opts) {
  const taskPath = await getTaskPath(opts)
  const tasks = await loadTaskFile(taskPath)
  const iterations = tasks
    .flatMap(getIteration)
    .map(iteration => ({ ...opts, taskPath, ...iteration }))
  return iterations
}

const getTaskPath = async function({ file, cwd }) {
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

export const loadTaskFile = function(taskPath) {
  // TODO: replace with `import()` once it is supported by default by ESLint
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const tasks = require(taskPath)
  const tasksA = normalizeTasks(tasks)
  return tasksA
}

const normalizeTasks = function(tasks) {
  return Object.entries(tasks).map(normalizeTask)
}

const normalizeTask = function([taskId, task]) {
  const { title = taskId, ...taskA } = normalizeTaskFunc(task)
  return { ...taskA, taskId, title }
}

const normalizeTaskFunc = function(task) {
  if (typeof task === 'function') {
    return { main: task }
  }

  return task
}

const getIteration = function({ taskId, title, parameters }) {
  if (parameters === undefined) {
    return [{ taskId, title }]
  }

  return Object.keys(parameters).map(parameter => ({
    taskId,
    title,
    parameter,
  }))
}
