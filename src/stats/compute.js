import { getHistogram } from './histogram.js'
import { getMedian } from './median.js'
import { getQuantiles } from './quantile.js'
import { getMean, getDeviation } from './sum.js'

// Retrieve statistics from results.
// Perform the statistical logic.
// Note that when `repeat > 1`, the distribution of the measured function will
// be modified by the repeat loop and transformed to a bell shape, even if
// if was not one. This means `quantiles`, `histogram` and `deviation` will
// have a different meaning: they visualize the measurements of the function not
// function itself.
// We do not remove outliers:
//  - Doing so make min|max|histogram change weirdly during live reporting
//  - It also makes most stats not true representation of the measures
//  - It complicates stats computation quite a lot
export const computeStats = function (measures) {
  const [min] = measures
  const max = measures[measures.length - 1]

  const median = getMedian(measures)
  const quantiles = getQuantiles(measures, QUANTILES_SIZE)
  const histogram = getHistogram(measures, HISTOGRAM_SIZE)

  const mean = getMean(measures)
  const deviation = getDeviation(measures, mean)

  return { median, mean, min, max, deviation, histogram, quantiles }
}

const QUANTILES_SIZE = 1e2
const HISTOGRAM_SIZE = 1e2

// Get stats not directly related to `measures`
// `times` is the number of times `main()` was called
// `loops` is the number of repeat loops
// `repeat` is the average number of iterations inside those repeat loops
export const addSideStats = function ({
  stats,
  loops,
  times,
  samples,
  minLoopDuration,
}) {
  const repeat = Math.round(times / loops)
  return { ...stats, loops, times, repeat, samples, minLoopDuration }
}
