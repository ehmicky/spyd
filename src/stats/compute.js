import { getConfidenceInterval } from './confidence.js'
import { getHistogram } from './histogram.js'
import { getLengthFromLoops } from './length.js'
import { getMoe, getRmoe } from './moe.js'
import { getOutliersPercentages } from './outliers/main.js'
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

  const stdev = getStdev(measures, { minIndex, maxIndex, mean })
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
