import { getColdStats } from './cold/main.js'
import { getHistogram } from './histogram.js'
import { getLengthFromLoops } from './length.js'
import { filterOutliers } from './outliers/filter.js'
import { getOutliersPercentage } from './outliers/main.js'
import { getPrecisionStats } from './precision.js'
import { getQuantiles, getSortedMedian } from './quantile.js'
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
//  - This is more robust for strongly multimodal distributions
//     - including with small integer measures, e.g. with the `manual` mode
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
// All of the following stats work well with precise floats, rounded floats and
// integers:
//  - The latter two can happen due to:
//     - Low time resolution
//     - Custom units returning integers or already rounded measures
// eslint-disable-next-line max-lines-per-function
export const computeStats = ({
  measures,
  unsortedMeasures,
  outliers,
  precision,
}) => {
  const { outliersMin, outliersMax } = getOutliersPercentage(measures, outliers)
  const { minIndex, maxIndex, length } = getLengthFromLoops(
    measures.length,
    outliersMin,
    outliersMax,
  )

  const { min, max, median, quantiles, filter } = getQuantileStats(
    measures,
    minIndex,
    maxIndex,
  )
  const mean = getMean(measures, { minIndex, maxIndex })
  const { cold, coldLoopsTarget } = getColdStats(unsortedMeasures, {
    precision,
    mean,
    filter,
    length,
  })

  const histogram = getHistogram(measures, {
    minIndex,
    maxIndex,
    bucketCount: HISTOGRAM_SIZE,
  })

  const { stdev, rstdev, moe, rmoe, meanMin, meanMax, envDev } =
    getPrecisionStats({
      measures,
      unsortedMeasures,
      minIndex,
      maxIndex,
      length,
      min,
      max,
      filter,
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
    cold,
    coldLoopsTarget,
    histogram,
    quantiles,
    outliersMin,
    outliersMax,
    envDev,
  }
}

const getQuantileStats = (measures, minIndex, maxIndex) => {
  const min = measures[minIndex]
  const max = measures[maxIndex]
  const median = getSortedMedian(measures, { minIndex, maxIndex })
  const quantiles = getQuantiles(measures, QUANTILES_COUNT, {
    minIndex,
    maxIndex,
  })
  const filter = filterOutliers.bind(undefined, min, max)
  return { min, max, median, quantiles, filter }
}

const QUANTILES_COUNT = 1e2
const HISTOGRAM_SIZE = 1e2
