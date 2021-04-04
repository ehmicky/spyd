import { getExtremes } from './extreme.js'
import { getHistogram } from './histogram.js'
import { getSortedMedian } from './median.js'
import { getMoe } from './moe.js'
import { getQuantiles } from './quantile.js'
import { getStdev } from './stdev.js'
import { getMean } from './sum.js'

// Retrieve statistics from results.
// Perform the statistical logic.
// Note that when `repeat > 1`, the distribution of the measured function will
// be modified by the repeat loop and transformed to a bell shape, even if
// if was not one. This means `quantiles`, `histogram` and `stdev` will
// have a different meaning: they visualize the measurements of the function not
// function itself.
// We do not compute the mode because:
//  - Reporting it together with the median might make it look like it is as
//    important. However, the median is a far more useful statistic.
//  - This would create too many statistics for the average, together with the
//    median and the mean.
export const computeStats = function (measures) {
  const { min, max, lowIndex, highIndex, low, high } = getExtremes(measures)

  const median = getSortedMedian(measures)
  const quantiles = getQuantiles(measures, QUANTILES_SIZE)
  const mean = getMean(measures)

  const histogram = getHistogram({
    array: measures,
    lowIndex,
    highIndex,
    bucketCount: HISTOGRAM_SIZE,
  })
  const stdev = getStdev({ array: measures, lowIndex, highIndex, median })
  const moe = getMoe(lowIndex, highIndex, stdev)

  return {
    median,
    mean,
    min,
    max,
    low,
    high,
    stdev,
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
  if (loops === 0 || loops === undefined) {
    return {}
  }

  const repeat = Math.round(times / loops)
  return { ...stats, loops, times, repeat, samples, minLoopDuration }
}
