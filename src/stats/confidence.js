// Retrieve the confidence interval.
// This is represented as `stats.meanMin` and `stats.meanMax`.
// When `showPrecision` is `true`, this is reported instead of `stats.mean`.
// This allows reporting both the approximate mean and its precision at once.
//  - When this happens, `stats.mean` is not reported
//  - This is easier to understand than reporting `stats.mean` and
//    `stats.moe|rmoe` because it is easier to visualize and to compare with
//    other combinations.
// We do not allow `stats.meanMin|meanMax` to go beyond `stats.min|max`:
//  - This is very unlikely to happen, although technically possible providing
//    both:
//     - The number of loops is very low
//     - `stats.rstdev` is very high, i.e. the distribution is very skewed
//  - This allows `stats.min|max` to be used in reporting as extreme boundaries
// This takes into account both the statistical variance (`moe`) and the
// environmental one (`envDev`).
// However, `envDev` is not used for the `rmoe` used to compute the overall
// benchmark duration:
//  - Reasons:
//     - `envDev` varies too much betweeen runs
//        - This creates very different benchmark durations, resulting in very
//          different stats
//     - `envDev` is always lower at the beginning of the run, which can result
//       in unexpectedly early exits
//  - As a downside, this means combinations with higher `envDev` are not run
//    longer, i.e. have lower precision at the end
export const getConfidenceInterval = function ({
  mean,
  adjustedMoe,
  min,
  max,
}) {
  const meanMin = Math.max(mean - adjustedMoe, min, 0)
  const meanMax = Math.min(mean + adjustedMoe, max)
  return { meanMin, meanMax }
}
