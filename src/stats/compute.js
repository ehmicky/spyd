import { getHistogram } from './histogram.js'
import { getSortedMedian } from './median.js'
import { getMean, getDeviation } from './methods.js'
import { getQuantiles } from './quantiles.js'

// Retrieve statistics from results.
// Perform the statistical logic.
// Note that when `repeat > 1`, the distribution of the measured function will
// be modified by the looping process and transformed to a bell shape, even if
// if was not one. This means `quantiles`, `histogram` and `deviation` will
// have a different meaning: they visualize the measurements of the function not
// function itself.
export const getStats = function ({ times, count, processes }) {
  // `count` is the number of times `main()` was called
  // `loops` is the number of repeat loops
  // `repeat` is the average number of iterations inside those repeat loops
  const loops = times.length
  const repeat = Math.round(count / loops)

  const {
    min,
    max,
    median,
    quantiles,
    histogram,
    mean,
    deviation,
  } = computeStats(times)

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
    quantiles,
  }
}

const computeStats = function (times) {
  const [min] = times
  const max = times[times.length - 1]

  const median = getSortedMedian(times)
  const quantiles = getQuantiles(times, QUANTILES_SIZE)
  const histogram = getHistogram(times, HISTOGRAM_SIZE)

  const mean = getMean(times)
  const deviation = getDeviation(times, mean)

  return { min, max, median, quantiles, histogram, mean, deviation }
}

const QUANTILES_SIZE = 1e2
const HISTOGRAM_SIZE = 1e2
