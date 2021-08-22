// Retrieve the confidence interval.
// This is represented as `stats.medianMin` and `stats.medianMax`.
// When `showPrecision` is `true`, this is reported instead of `stats.median`.
// This allows reporting both the approximate median and its precision at once.
//  - When this happens, `stats.median` is not reported
//  - This is easier to understand than reporting `stats.median` and
//    `stats.moe|rmoe` because it is easier to visualize and to compare with
//    other combinations.
// We do not allow `stats.medianMin|medianMax` to go beyond `stats.min|max`:
//  - This is very unlikely to happen, although technically possible providing
//    both:
//     - The number of loops is very low
//     - `stats.rstdev` is very high, i.e. the distribution is very skewed
//  - This allows `stats.min|max` to be used in reporting as extreme boundaries
export const getConfidenceInterval = function ({ median, moe, min, max }) {
  const medianMin = Math.max(median - moe, min, 0)
  const medianMax = Math.min(median + moe, max)
  return { medianMin, medianMax }
}
