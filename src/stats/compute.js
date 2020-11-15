import { getHistogram } from './histogram.js'
import { getMedian, getMean, getDeviation } from './methods.js'
import { removeOutliers } from './outliers.js'
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
export const getStats = function ({ results, count }) {
  const times = aggregateTimes(results)
  // Half of the statistics require the array to be sorted
  sortNumbers(times)

  const { times: timesA, count: countA } = removeOutliers(times, count)

  // `count` is the number of times `main()` was called
  // `loops` is the number of benchmark loops
  // `repeat` is the average number of iterations inside those benchmark loops
  const loops = timesA.length
  const repeat = Math.round(countA / loops)
  const processes = results.length

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
    count: countA,
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
  return results.flatMap(identity)
}

const identity = function (value) {
  return value
}

const HISTOGRAM_SIZE = 1e2
