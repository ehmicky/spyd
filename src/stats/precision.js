import { getConfidenceInterval } from './confidence.js'
import { getEnvDev } from './env_dev/main.js'
import { getAdjustedMoe, getMoe, getRmoe } from './moe.js'
import { getVarianceStats } from './variance.js'

// Retrieve stats related to `stdev` and precision.
export const getPrecisionStats = ({
  measures,
  unsortedMeasures,
  minIndex,
  maxIndex,
  length,
  min,
  max,
  filter,
  mean,
}) => {
  if (length < MIN_STDEV_LOOPS) {
    return {}
  }

  if (mean === 0) {
    return getPerfectPrecisionStats(mean)
  }

  const { realVariance, stdev, rstdev } = getVarianceStats(measures, {
    minIndex,
    maxIndex,
    min,
    max,
    mean,
  })
  const envDev = getEnvDev(unsortedMeasures, {
    mean,
    variance: realVariance,
    filter,
  })
  const { moe, rmoe, meanMin, meanMax } = getMoeStats({
    stdev,
    envDev,
    length,
    min,
    max,
    mean,
  })
  return { stdev, rstdev, moe, rmoe, meanMin, meanMax, envDev }
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
//       that many times higher for sample sizes 2, 3, 4 and 5:
//       31.9, 6.26, 3.73, 2.87 and 2.45
//  - That ratio improves less and less as sample size increases, with most
//    of the gain being when sample size goes from 2 to 5
//  - With sample size 4, when moe was invalid, the difference ratio is:
//     - 1.6x in average
//     - 2.5x 90% of times
//     - 5x 99% of times
//     - 10x 99.9% of times
// A higher value:
//  - Makes tasks with very low `rstdev` last longer that they should
//     - This is especially a problem for slow tasks
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
//     - I.e. the first previews might be imprecise
const MIN_STDEV_LOOPS = 4

// We allow means to be 0 since some tasks might really return always the same
// measure.
// We handle those the same way as if all measures were 0s:
//  - Because this is almost always the case
//  - Although the contrary is possible in principle if some measures are close
//    to `Number.EPSILON`
// We make sure this is only returned after `length` is high enough, since
// mean might be 0 due to a low sample size
const getPerfectPrecisionStats = (mean) => ({
  stdev: 0,
  rstdev: 0,
  moe: 0,
  rmoe: 0,
  meanMin: mean,
  meanMax: mean,
  envDev: 0,
})

const getMoeStats = ({ stdev, envDev, length, min, max, mean }) => {
  const adjustedMoe = getAdjustedMoe(stdev, length, envDev)
  const moe = getMoe(stdev, length)
  const rmoe = getRmoe(moe, mean)
  const { meanMin, meanMax } = getConfidenceInterval({
    mean,
    adjustedMoe,
    min,
    max,
  })
  return { moe, rmoe, meanMin, meanMax }
}
