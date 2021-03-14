import {
  getStandardDeviation,
  getRelativeDeviation,
  getRelativeMarginOfError,
} from './deviation.js'
import { getExtremes } from './extreme.js'
import { getHistogram } from './histogram.js'
import { getSortedMedian } from './median.js'
import { getQuantiles } from './quantile.js'
import { getMean } from './sum.js'

// Retrieve statistics from results.
// Perform the statistical logic.
// Note that when `repeat > 1`, the distribution of the measured function will
// be modified by the repeat loop and transformed to a bell shape, even if
// if was not one. This means `quantiles`, `histogram` and `deviation` will
// have a different meaning: they visualize the measurements of the function not
// function itself.
// We do not remove outliers:
//  - Doing so make min|max|histogram change weirdly during results preview
//  - It also makes most stats not true representation of the measures
//  - It complicates stats computation quite a lot
export const computeStats = function (measures) {
  const { min, max, lowIndex, highIndex, low, high } = getExtremes(measures)

  // TODO: do not clone array
  const normalizedMeasures = measures.slice(lowIndex, highIndex + 1)

  const median = getSortedMedian(measures)
  const quantiles = getQuantiles(measures, QUANTILES_SIZE)
  const histogram = getHistogram(normalizedMeasures, HISTOGRAM_SIZE)

  const mean = getMean(measures)
  const standardDeviation = getStandardDeviation(normalizedMeasures, median)
  const deviation = getRelativeDeviation(standardDeviation, median)
  const moe = getRelativeMarginOfError(
    normalizedMeasures,
    standardDeviation,
    median,
  )

  return {
    median,
    mean,
    min,
    max,
    low,
    high,
    deviation,
    moe,
    histogram,
    quantiles,
  }
}

const QUANTILES_SIZE = 1e2
const HISTOGRAM_SIZE = 1e2

// Add stats not directly related to `measures`
// `times` is the number of times `main()` was called
// `loops` is the number of repeat loops
// `repeat` is the average number of iterations inside those repeat loops
// `stats` is `undefined` when `sample` is `0`:
//   - This happens when not measured yet or on uncalibrated stats.
//   - Uncalibrated stats are removed because they:
//      - Are eventually reset, which create confusion for stats like min or max
//      - Change a lot, creating flicker
//   - This happens both during preview or during the final report if measuring
//     was stopped
export const getFinalStats = function ({
  stats,
  loops,
  times,
  samples,
  minLoopDuration,
}) {
  if (loops === 0) {
    return {}
  }

  const repeat = Math.round(times / loops)
  return { ...stats, loops, times, repeat, samples, minLoopDuration }
}
