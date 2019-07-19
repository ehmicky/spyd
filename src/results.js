import { measure } from './measure.js'
import { getStats } from './stats.js'

export const getTasksResults = async function({
  tasks,
  opts,
  opts: { repeat },
}) {
  const loop = Array.from({ length: repeat }, getIndex)
  const promises = tasks.map(task => getTaskResults({ task, loop, opts }))
  const results = await Promise.all(promises)
  const resultsA = results.flat()
  return resultsA
}

const getIndex = function(value, index) {
  return index
}

const getTaskResults = async function({
  task,
  task: { name, main, parameters },
  loop,
  opts,
}) {
  const taskA = { ...task, name }

  if (parameters === undefined) {
    const result = await getParamResult({ name, main, loop, task: taskA, opts })
    return [result]
  }

  const promises = parameters.map(
    ({ name: parameter, values: args, cleanup }) =>
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
  const results = await Promise.all(promises)
  return results
}

const getParamResult = async function({
  name,
  main,
  parameter,
  args = [],
  cleanup,
  loop,
  task,
  opts,
}) {
  const promises = loop.map(() => getDuration({ main, args, cleanup }))
  const durations = await Promise.all(promises)
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
