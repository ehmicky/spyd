import pTimes from 'p-times'

import { measure } from './measure.js'
import { getStats } from './stats.js'

export const getTasksResults = async function(tasks, opts) {
  const promises = tasks.map(task => getTaskResults(task, opts))
  const results = await Promise.all(promises)
  const resultsA = results.flat()
  return resultsA
}

const getTaskResults = async function({ parameters, ...task }, opts) {
  if (parameters === undefined) {
    const result = await getParamResult({ task, opts })
    return [result]
  }

  const promises = parameters.map(
    ({ name: parameter, values: args, cleanup }) =>
      getParamResult({ task, parameter, args, cleanup, opts }),
  )
  const results = await Promise.all(promises)
  return results
}

const getParamResult = async function({
  task: { name, main },
  parameter,
  args = [],
  cleanup,
  opts: { repeat },
}) {
  const durations = await pTimes(
    repeat,
    () => getDuration({ main, args, cleanup }),
    {},
  )
  const duration = getStats(durations)
  return { task: name, parameter, duration }
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
