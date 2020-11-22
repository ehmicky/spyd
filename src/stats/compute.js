import { getHistogram } from './histogram.js'
import { getMedian, getMean, getSum, getDeviation } from './methods.js'
import { removeOutlierProcesses, removeOutlierTimes } from './outliers.js'
import { getPercentiles } from './percentiles.js'
import { sortNumbers } from './sort.js'

// Retrieve statistics from a raw set of benchmark results
// Perform the statistical logic.
// Note that when `repeat > 1`, the distribution of the measured function will
// be modified by the looping process and transformed to a bell shape, even if
// if was not one. This means `percentiles`, `histogram` and `deviation` will
// have a different meaning: they visualize the measurements of the function not
// function itself.
// eslint-disable-next-line max-statements
export const getStats = function (results) {
  const resultsA = removeOutlierProcesses(results)

  const times = aggregateTimes(resultsA)
  // Half of the statistics require the array to be sorted
  sortNumbers(times)
  const { times: timesA, outliersMax } = removeOutlierTimes(times)

  const count = getCount(resultsA, outliersMax)

  // `count` is the number of times `main()` was called
  // `loops` is the number of benchmark loops
  // `repeat` is the average number of iterations inside those benchmark loops
  const loops = timesA.length
  const repeat = Math.round(count / loops)
  const processes = resultsA.length

  const [min] = timesA
  const max = timesA[timesA.length - 1]

  const median = getMedian(timesA)
  const percentiles = getPercentiles(timesA)
  const histogram = getHistogram(timesA, HISTOGRAM_SIZE)

  const mean = getMean(timesA)
  const deviation = getDeviation(timesA, mean)

  return {
    median,
    mean,
    min,
    max,
    deviation,
    count,
    loops,
    repeat,
    processes,
    histogram,
    percentiles,
  }
}

// We do not use `[].concat(...results)` because it creates a stack overflow if
// `results.length` is too large (~1e5 on my machine)
const aggregateTimes = function (results) {
  return results.flatMap(getTimes)
}

const getTimes = function ({ times }) {
  return times
}

// Retrieve the number of times the task was run, including inside a repeated
// loop. Takes into account the fact that some `times` were removed as outliers.
const getCount = function (results, outliersMax) {
  const resultCounts = results.map(({ times, repeat }) =>
    getResultCount({ times, repeat, outliersMax }),
  )
  return getSum(resultCounts)
}

const getResultCount = function ({ times, repeat, outliersMax }) {
  return times.filter((time) => time < outliersMax).length * repeat
}

const HISTOGRAM_SIZE = 1e2
