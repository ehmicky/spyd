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
export const getStats = function ({ measures, times, processes }) {
  // `times` is the number of times `main()` was called
  // `loops` is the number of repeat loops
  // `repeat` is the average number of iterations inside those repeat loops
  const loops = measures.length
  const repeat = Math.round(times / loops)

  const {
    min,
    max,
    median,
    quantiles,
    histogram,
    mean,
    deviation,
  } = computeStats(measures)

  return {
    median,
    mean,
    min,
    max,
    deviation,
    times,
    loops,
    repeat,
    processes,
    histogram,
    quantiles,
  }
}

const computeStats = function (measures) {
  const [min] = measures
  const max = measures[measures.length - 1]

  const median = getSortedMedian(measures)
  const quantiles = getQuantiles(measures, QUANTILES_SIZE)
  const histogram = getHistogram(measures, HISTOGRAM_SIZE)

  const mean = getMean(measures)
  const deviation = getDeviation(measures, mean)

  return { min, max, median, quantiles, histogram, mean, deviation }
}

const QUANTILES_SIZE = 1e2
const HISTOGRAM_SIZE = 1e2
