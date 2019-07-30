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

export const getTasksInputs = function(tasks) {
  return tasks.flatMap(getTasksInput)
}

const getTasksInput = function({ taskId, title, parameters }) {
  if (parameters === undefined) {
    return [{ taskId, title }]
  }

  return Object.keys(parameters).map(parameter => ({
    taskId,
    title,
    parameter,
  }))
}

export const loadTask = function(taskPath, taskId, parameter) {
  const tasks = loadTaskFile(taskPath)
  const { main, before, after, parameters } = tasks.find(
    task => task.taskId === taskId,
  )
  const [mainA, beforeA, afterA] = bindParameter(parameters, parameter, [
    main,
    before,
    after,
  ])
  return { main: mainA, before: beforeA, after: afterA }
}

const bindParameter = function(parameters, parameter, funcs) {
  if (parameter === undefined) {
    return funcs
  }

  const parameterValue = parameters[parameter]
  return funcs.map(func => bindFunction(func, parameterValue))
}

const bindFunction = function(func, parameterValue) {
  if (func === undefined) {
    return
  }

  return func.bind(null, parameterValue)
}
