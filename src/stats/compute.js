import { getConfidenceInterval } from './confidence.js'
import { getHistogram } from './histogram.js'
import { getLengthFromLoops } from './length.js'
import { getMoe, getRmoe } from './moe.js'
import { getOutliersPercentages } from './outliers/main.js'
import { getSortedMedian, getQuantiles } from './quantile.js'
import { getVariance, getStdev, getRstdev } from './stdev.js'
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
//     - It prevents computing `stdev` and related stats if the `mean` is `0`
//     - It decreases `stdev` if many measures are exactly `0`. This leads to
//       reaching the target `precision` even though stats are imprecise.
//  - This is mostly prevented by:
//     - Including the minimum time resolution in `minLoopDuration`
//     - Multiplying `repeat` when the `sampleMedian` is `0`, including during
//       calibration
// The main central tendency statistic meant to be reported is the arithmetic
// mean, not the median because:
//  - Users are likely to repeat a task in real code, i.e. are interested in the
//    long tail of slower durations.
//  - This works better with small integer measures, e.g. with the `manual` mode
//  - This discourages users to manually loop inside their tasks, since we
//    already do it for them.
//  - The `stdev` and `moe` formulas are different and more complex for `median`
//  - Other benchmark tools tend to use the arithmetic mean, so using it too
//    results in:
//     - Less potential for debate about tools' statistical choice
//     - Less unexpected change of results when switching from another tool
//       to this one
//  - Since we remove outliers, the `mean` ends up having a similar `stdev` as
//    the `median` most of the times
//     - Except for very skewed distributions
//     - However, since we use a `rmoe` threshold, this only increases the
//       benchmark's duration, not its precision
// We do not compute the mode because:
//  - Reporting it together with the mean might make it look like it is as
//    important. However, the mean is a far more useful statistic.
//  - This would create too many statistics for the average, together with the
//    mean and the median.
export const computeStats = function (measures) {
  const { outliersMin, outliersMax } = getOutliersPercentages(measures)
  const { minIndex, maxIndex, length } = getLengthFromLoops(
    measures.length,
    outliersMin,
    outliersMax,
  )

  const min = measures[minIndex]
  const max = measures[maxIndex]
  const median = getSortedMedian(measures, { minIndex, maxIndex })
  const quantiles = getQuantiles(measures, QUANTILES_COUNT, {
    minIndex,
    maxIndex,
  })

  const mean = getMean(measures, { minIndex, maxIndex })

  const histogram = getHistogram(measures, {
    minIndex,
    maxIndex,
    bucketCount: HISTOGRAM_SIZE,
  })

  const { stdev, rstdev, moe, rmoe, meanMin, meanMax } = getPrecisionStats({
    measures,
    minIndex,
    maxIndex,
    length,
    min,
    max,
    mean,
  })

  return {
    mean,
    meanMin,
    meanMax,
    median,
    min,
    max,
    stdev,
    rstdev,
    moe,
    rmoe,
    histogram,
    quantiles,
    outliersMin,
    outliersMax,
  }
}

const QUANTILES_COUNT = 1e2
const HISTOGRAM_SIZE = 1e2

// Retrieve stats related to `stdev`.
const getPrecisionStats = function ({
  measures,
  minIndex,
  maxIndex,
  length,
  min,
  max,
  mean,
}) {
  if (length < MIN_STDEV_LOOPS) {
    return {}
  }

  if (mean === 0) {
    return getPerfectPrecisionStats(mean)
  }

  const variance = getVariance(measures, { minIndex, maxIndex, mean })
  const stdev = getStdev(variance)
  const rstdev = getRstdev(stdev, mean)
  const moe = getMoe(stdev, length)
  const rmoe = getRmoe(moe, mean)
  const { meanMin, meanMax } = getConfidenceInterval({ mean, moe, min, max })
  return { stdev, rstdev, moe, rmoe, meanMin, meanMax }
}

// We allow means to be 0 since some tasks might really return always the same
// measure.
// We handle those the same way as if all measures were 0s:
//  - Because this is almost always the case
//  - Although the contrary is possible in principle if some measures are close
//    to `Number.EPSILON`
// We make sure this is only returned after `length` is high enough, since
// mean might be 0 due to a low sample size
const getPerfectPrecisionStats = function (mean) {
  return { stdev: 0, rstdev: 0, moe: 0, rmoe: 0, meanMin: mean, meanMax: mean }
}

// `stdev` might be very imprecise when there are not enough values to compute
// it from.
//  - This follows a chi-squared distribution
// Since we use a t-distribution with 95% significance level:
//  - For 95% of runs, `moe` will contain the real `mean` providing:
//     - measures are normally distributed
//     - the specific environment and load remain the same
//  - This applies even when sample size is very low, even 2, thanks to the
//    t-value
// However, for the 5% remaining runs, the average ratio between what `moe` is
// and what it should have been is much higher when sample size is very low:
//  - That ratio follows a chi-squared distribution, just like `stdev` itself
//     - Using a single tail
//     - For example, for 97.5% of those 5% remaining runs, moe will be at most
//       that many times higher for sample sizes 2, 3, 4 and 5: 31.9, 6.26,
//       3.73, 2.87, 2.45
//  - That ratio improves less and less as sample size increases, with most
//    of the gain being when sample size goes from 2 to 5
//  - With sample size 4, when moe was invalid, the difference ratio is 1.6x
//    in average, 2.5x 90% of times, 5x 99% of times and 10x 99.9% of times
// A higher value:
//  - Makes tasks with very low `rstdev` last longer that they should
//  - Delays when `stdev`, `moe` and expected duration are first reported in
//    previews
// A lower value makes it more likely to use imprecise `stdev` and `moe` which
// is a problem since it is:
//  - Used to know whether to stop measuring
//     - This might lead to stopping measuring too early with imprecise results.
//  - Used to estimate the duration left in previews.
//     - Due to the preview's smoothing algorithm, imprecise stdev in the first
//       previews have an impact on the next previews.
//  - Reported
const MIN_STDEV_LOOPS = 4
