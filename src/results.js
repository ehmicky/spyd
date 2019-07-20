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

const getTaskResults = async function(
  { name: task, main, parameters, before, after },
  opts,
) {
  if (parameters === undefined) {
    const result = await getParamResult({
      task,
      main,
      param: [],
      before,
      after,
      opts,
    })
    return [result]
  }

  // Run each parameter serially to avoid one parameter influencing the timing
  // of another
  const results = await pMapSeries(
    Object.entries(parameters),
    ([paramName, param]) =>
      getParamResult({
        task,
        main,
        paramName,
        param: [param],
        before,
        after,
        opts,
      }),
  )
  return results
}

const getParamResult = async function({
  task,
  main,
  paramName,
  param,
  before,
  after,
  opts: { repeat, concurrency },
}) {
  // Run repetitions in parallel to make the run faster
  const durations = await pTimes(
    repeat,
    () => getDuration({ main, param, before, after }),
    { concurrency },
  )
  const duration = getStats(durations)
  return { task, parameter: paramName, duration }
}

const getDuration = async function({ main, param, before, after }) {
  const args = await performBefore(before, param)
  const mainA = bindArgs(main, args)
  const duration = await measure(mainA)
  await performAfter(after, args)
  return duration
}

const performBefore = async function(before, param) {
  if (before === undefined) {
    return param
  }

  const arg = await before(...param)
  return [...param, arg]
}

const bindArgs = function(main, args) {
  if (args.length === 0) {
    return main
  }

  return main.bind(null, ...args)
}

const performAfter = function(after, args) {
  if (after === undefined) {
    return
  }

  after(...args)
}
