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
export const getOutliersStats = function (measures) {
  const loops = measures.length
  const outliersMin = OUTLIERS_MIN
  const outliersMax = OUTLIERS_MAX
  const { minIndex, maxIndex, length } = getLengthFromLoops(
    loops,
    outliersMin,
    outliersMax,
  )
  const min = measures[minIndex]
  const max = measures[maxIndex]
  return { outliersMin, outliersMax, minIndex, maxIndex, length, min, max }
}

// A higher value is less accurate as more information is trimmed.
// A lower value is less precise as outliers will have a higher impact on the
// mean. It also results in poorer histograms.
const OUTLIERS_MIN = 0.05
const OUTLIERS_MAX = 0.05

// `Math.round()` rounds towards +Inf:
//  - This makes outliers removal start twice faster. For example, with 5%
//    outliers on each end, this starts after 10 loops, not 20.
// We remove 1 from `loops` when computing the number of max outliers:
//  - This ensures both low and high outliers are not removed at the same time,
//    which would mean adding one `measure` could potentially remove one from
//    `length`
const getLengthFromLoops = function (loops, outliersMin, outliersMax) {
  const minIndex = Math.round(loops * outliersMin)
  const maxIndex = loops - 1 - Math.round((loops - 1) * outliersMax)
  const length = maxIndex - minIndex + 1
  return { minIndex, maxIndex, length }
}

// Inverse function of `getLengthFromLoops()`, i.e. retrieves `loops` from
// `length`. Due to the use of multiple `Math.round()`, the result might be
// 1 lower|higher than the actual result.
export const getLoopsFromLength = function (length, outliersMin, outliersMax) {
  return Math.round(length / (1 - outliersMax - outliersMin))
}
