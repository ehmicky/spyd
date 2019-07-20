import pTimes from 'p-times'
import pMapSeries from 'p-map-series'

import { measure } from './measure.js'
import { getStats } from './stats.js'

export const getTasksResults = async function(tasks, opts) {
  // Run each task serially to avoid one task influencing the timing of another
  const results = await pMapSeries(tasks, task => getTaskResults(task, opts))
  const resultsA = results.flat()
  return resultsA
}

const getTaskResults = async function({ parameters, cleanup, ...task }, opts) {
  if (parameters === undefined) {
    const result = await getParamResult({ task, cleanup, opts })
    return [result]
  }

  // Run each parameter serially to avoid one parameter influencing the timing
  // of another
  const results = await pMapSeries(
    parameters,
    ({ name: parameter, values: args }) =>
      getParamResult({ task, parameter, args, cleanup, opts }),
  )
  return results
}

const getParamResult = async function({
  task: { name, main },
  parameter,
  args = [],
  cleanup,
  opts: { repeat, concurrency },
}) {
  // Run repetitions in parallel to make the run faster
  const durations = await pTimes(
    repeat,
    () => getDuration({ main, args, cleanup }),
    { concurrency },
  )
  const duration = getStats(durations)
  return { task: name, parameter, duration }
}

const getDuration = async function({ main, args, cleanup }) {
  const argsA = await callArgs(args)
  const mainA = bindArgs(main, argsA)
  const duration = await measure(mainA)
  await performCleanup(cleanup, argsA)
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
