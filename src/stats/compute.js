import { sortNumbers } from '../utils/sort.js'

import { getHistogram } from './histogram.js'
import { getMedian, getMean, getDeviation } from './methods.js'
import { removeOutliers } from './outliers.js'
import { getPercentiles } from './percentiles.js'

// Retrieve statistics from a raw set of benchmark results
// Perform the statistical logic.
// Note that when `repeat > 1`, the distribution of the measured function will
// be modified by the looping process and transformed to a bell shape, even if
// if was not one. This means `percentiles`, `histogram` and `deviation` will
// have a different meaning: they visualize the measurements of the function not
// function itself.
// eslint-disable-next-line max-statements
export const getStats = function ({ times, count, processes }) {
  // Half of the statistics require the array to be sorted
  sortNumbers(times)

  const { times: timesA, count: countA } = removeOutliers(times, count)

  // `count` is the number of times `main()` was called
  // `loops` is the number of benchmark loops
  // `repeat` is the average number of iterations inside those benchmark loops
  const loops = timesA.length
  const repeat = Math.round(countA / loops)

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

const HISTOGRAM_SIZE = 1e2
