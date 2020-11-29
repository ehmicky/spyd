import { getHistogram } from './histogram.js'
import { getSortedMedian } from './median.js'
import { getMin, getMax, getMean, getDeviation } from './methods.js'
import { getOutliersMax, OUTLIERS_THRESHOLD } from './outliers.js'
import { getQuantiles } from './quantiles.js'

// Retrieve statistics from results.
// Perform the statistical logic.
// Note that when `repeat > 1`, the distribution of the measured function will
// be modified by the looping process and transformed to a bell shape, even if
// if was not one. This means `quantiles`, `histogram` and `deviation` will
// have a different meaning: they visualize the measurements of the function not
// function itself.
export const getStats = function ({
  measures,
  times,
  processes,
  measureCost,
  repeatCost,
  loadCost,
}) {
  const {
    loops,
    repeat,
    min,
    max,
    median,
    quantiles,
    histogram,
    mean,
    deviation,
  } = computeStats(measures, times)

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
    measureCost,
    repeatCost,
    loadCost,
  }
}

const computeStats = function (measures, times) {
  // `times` is the number of times `main()` was called
  // `loops` is the number of repeat loops
  // `repeat` is the average number of iterations inside those repeat loops
  const loops = getOutliersMax(measures, OUTLIERS_THRESHOLD)
  const repeat = Math.round(times / loops)

  const min = getMin(measures)
  const max = getMax(measures, OUTLIERS_THRESHOLD)

  const median = getSortedMedian(measures, OUTLIERS_THRESHOLD)
  const quantiles = getQuantiles(measures, QUANTILES_SIZE, OUTLIERS_THRESHOLD)
  const histogram = getHistogram(measures, HISTOGRAM_SIZE, OUTLIERS_THRESHOLD)

  const mean = getMean(measures, OUTLIERS_THRESHOLD)
  const deviation = getDeviation(measures, mean, OUTLIERS_THRESHOLD)

  return {
    loops,
    repeat,
    min,
    max,
    median,
    quantiles,
    histogram,
    mean,
    deviation,
  }
}

const QUANTILES_SIZE = 1e2
const HISTOGRAM_SIZE = 1e2
