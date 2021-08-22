import { getConfidenceInterval } from './confidence.js'
import { getExtremes } from './extreme.js'
import { getHistogram } from './histogram.js'
import { getMoe, getRmoe } from './moe.js'
import { getSortedMedian, getQuantiles } from './quantile.js'
import { getStdev, getRstdev } from './stdev.js'
import { getMean } from './sum.js'

// Aggregate measures into discrete statistics.
// Note that when `repeat > 1`:
//  - The distribution of the measured function will be modified by the repeat
//    loop and transformed to a bell shape, even if if was not one
//  - This means `quantiles`, `histogram` and `stdev` will have a different
//    meaning: they visualize the measurements of the function not function
//    itself.
// Some measures might be `0`:
//  - This happens when the task is faster than the minimum time resolution
//  - This is bad because:
//     - It is confusing to users
//     - It prevents computing `stdev` and related stats if the `median` is `0`
//     - It decreases `stdev` if many measures are exactly `0`. This leads to
//       reaching the target `precision` even though stats are imprecise.
//  - This is mostly prevented by:
//     - Including the minimum time resolution in `minLoopDuration`
//     - Multiplying `repeat` when the `sampleMedian` is `0`, including during
//       calibration
// We do not compute the mode because:
//  - Reporting it together with the median might make it look like it is as
//    important. However, the median is a far more useful statistic.
//  - This would create too many statistics for the average, together with the
//    median and the mean.
export const computeStats = function (measures) {
  const { minIndex, maxIndex, length, min, max } = getExtremes(measures)

  const median = getSortedMedian(measures)
  const quantiles = getQuantiles(measures, QUANTILES_SIZE)
  const mean = getMean(measures)

  const histogram = getHistogram({
    array: measures,
    minIndex,
    maxIndex,
    length,
    bucketCount: HISTOGRAM_SIZE,
  })

  const { stdev, rstdev, moe, rmoe, medianMin, medianMax } = getPrecisionStats({
    measures,
    minIndex,
    maxIndex,
    length,
    min,
    max,
    median,
  })

  return {
    median,
    medianMin,
    medianMax,
    mean,
    min,
    max,
    stdev,
    rstdev,
    moe,
    rmoe,
    histogram,
    quantiles,
  }
}

const QUANTILES_SIZE = 1e2
const HISTOGRAM_SIZE = 1e2

// Retrieve stats related to `stdev`. Those might be absent if the number of
// loops is low.
const getPrecisionStats = function ({
  measures,
  minIndex,
  maxIndex,
  length,
  min,
  max,
  median,
}) {
  if (median === 0 || length < MIN_STDEV_LOOPS) {
    return {}
  }

  const stdev = getStdev({
    array: measures,
    minIndex,
    maxIndex,
    length,
    median,
  })
  const rstdev = getRstdev(stdev, median)
  const moe = getMoe(stdev, length)
  const rmoe = getRmoe(moe, median)
  const { medianMin, medianMax } = getConfidenceInterval({
    median,
    moe,
    min,
    max,
  })
  return { stdev, rstdev, moe, rmoe, medianMin, medianMax }
}

// `stdev` might be very imprecise when there are not enough values to compute
// it from. This is a problem since `stdev` is:
//  - Used to compute the `moe`, which is used to know whether to stop
//    measuring. Imprecise `stdev` might lead to stopping measuring too early
//    resulting in imprecise overall results.
//  - Used to estimate the duration left in previews. Due to the preview's
//    smoothing algorithm, imprecise stdev in the first previews have an
//    impact on the next previews.
//  - Reported
// From a statistical standpoint:
//  - T-values counteract the imprecision brought by the low number of loops
//  - So `stdev`/`moe` are statistically significant with a 95% confidence
//    interval even when there are only 2 loops.
//  - However, the 5% of cases outside of that confidence interval have a bigger
//    difference (in average) to the real value, when the number of loops is
//    low. I.e. while the probability of errors is the same, the impact size is
//    bigger.
// A higher value makes standard deviation less likely to be computed for very
// slow tasks.
// A lower value makes it more likely to use imprecise standard deviations.
const MIN_STDEV_LOOPS = 5
