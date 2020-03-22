import { sortNumbers } from '../utils/sort.js'

import { getMedian, getMean, getDeviation } from './methods.js'
import { getPercentiles } from './percentiles.js'
import { getHistogram } from './histogram.js'

// Retrieve statistics from a raw set of benchmark results
export const getStats = function (results) {
  const times = results.flatMap(getTimes)
  const count = results.reduce(reduceCount, 0)
  // Number of child processes that provided with benchmarks results
  const processes = results.length

  const stats = computeStats({ times, count, processes })
  return stats
}

// Merge all processes measurements
const getTimes = function ({ times }) {
  return times
}

// Retrieve total `count`
const reduceCount = function (totalCount, { count }) {
  return totalCount + count
}

// Perform the statistical logic.
// Note that when `repeat > 1`, the distribution of the measured function will
// be modified by the looping process and transformed to a bell shape, even if
// if was not one. This means `percentiles`, `histogram` and `deviation` will
// have a different meaning: they visualize the measurements of the function not
// function itself.
// eslint-disable-next-line max-statements
const computeStats = function ({ times, count, processes }) {
  // Half of the statistics require the array to be sorted
  sortNumbers(times)

  // `count` is the number of times `main()` was called
  // `loops` is the number of benchmark loops
  // `repeat` is the average number of iterations inside those benchmark loops
  const loops = times.length
  const repeat = Math.round(count / loops)

  const [min] = times
  const max = times[times.length - 1]

  const median = getMedian(times)
  const percentiles = getPercentiles(times)
  const histogram = getHistogram(times, HISTOGRAM_SIZE)

  const mean = getMean(times)
  const deviation = getDeviation(times, mean)

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

// Choose to be detailed when displayed on a normal computer screen size
const HISTOGRAM_SIZE = 1e3
