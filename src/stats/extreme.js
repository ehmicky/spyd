// Measures usually contain some:
//  - Very slow outliers due to background processes or engine optimization
//  - Faster outliers for similar reasons, although they are less frequent
// We remove both:
//  - Those are not good when determining the normal distribution of measures:
//     - They create a distribution with a very long tail, which is hard to
//       visualize with `histogram`
//     - They make `stdev`, `rstdev`, `moe` and `rmoe` must less useful
//  - Using outliers in some stats but not others would lead to inconsistency
//    and unexpected or ambiguous results
//  - This would require two sets of `min|max` stats (with and without outliers)
//  - Despite this, those would be useful to know worst-case scenarios or the
//    average performance when repeated. We tradeoff simplicity for accuracy.
// We apply those percentage without cloning the `measures` array, for
// performance and memory reasons.
export const getExtremes = function (measures) {
  const loops = measures.length - 1
  const { minIndex, maxIndex, length } = getLengthFromLoops(loops)
  const min = measures[minIndex]
  const max = measures[maxIndex]
  return { minIndex, maxIndex, length, min, max }
}

// `Math.round()` rounds towards +Inf, which is what we want:
//  - This ensures both low and high outliers are not removed at the same time,
//    which would mean adding one `measure` could potentially remove one from
//    `length`
//  - This makes outliers removal start twice faster. For example, with 5%
//    outliers on each end, this starts after 10 loops, not 20.
export const getLengthFromLoops = function (loops) {
  const minIndex = Math.round(loops * MIN_OUTLIERS)
  const maxIndex = Math.round(loops * MAX_OUTLIERS)
  const length = maxIndex - minIndex + 1
  return { minIndex, maxIndex, length }
}

// Inverse function of `getLengthFromLoops()`, i.e. retrieves `loops` from
// `length`. Due to the use of multiple `Math.round()`, the result might be
// 1 lower|higher than the actual result.
export const getLoopsFromLength = function (length) {
  return Math.round(length / (MAX_OUTLIERS - MIN_OUTLIERS)) - 1
}

// A higher value makes histograms give less information about very low/high
// values.
// A lower value makes it more likely for outliers to overtake the histogram,
// concentrating most of the values into far fewer buckets.
const MIN_OUTLIERS = 0.05
// Having the same percentage for slow/fast outliers ensures the `median`
// remains the same.
const MAX_OUTLIERS = 1 - MIN_OUTLIERS
