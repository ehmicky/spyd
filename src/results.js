import { measure } from './measure.js'
import { getStats } from './stats.js'

export const getTasksResults = function({ tasks, opts, opts: { repeat } }) {
  const loop = Array.from({ length: repeat }, getIndex)
  return tasks.flatMap(task => getTaskResults({ task, loop, opts }))
}

const getIndex = function(value, index) {
  return index
}

const getTaskResults = function({
  task,
  task: { name, main, parameters },
  loop,
  opts,
}) {
  const taskA = { ...task, name }

  if (parameters === undefined) {
    return getParamResult({ name, main, loop, task: taskA, opts })
  }

  return parameters.map(({ name: parameter, values: args, cleanup }) =>
    getParamResult({
      name,
      main,
      parameter,
      args,
      cleanup,
      loop,
      task: taskA,
      opts,
    }),
  )
}

const getParamResult = function({
  name,
  main,
  parameter,
  args = [],
  cleanup,
  loop,
  task,
  opts,
}) {
  const durations = loop.map(() => getDuration({ main, args, cleanup }))
  const duration = getStats(durations)
  return { name, task, parameter, duration, opts }
}

const getDuration = function({ main, args, cleanup }) {
  const argsA = callArgs(args)
  const mainA = bindArgs(main, argsA)
  const duration = measure(mainA)
  performCleanup(cleanup, argsA)
  return duration
}

const callArgs = function(args) {
  if (typeof args !== 'function') {
    return args
  }

  return args()
}

const bindArgs = function(main, args) {
  if (args.length === 0) {
    return main
  }

  return main.bind(null, ...args)
}

const performCleanup = function(cleanup, args) {
  if (cleanup === undefined) {
    return
  }

  cleanup(...args)
}
