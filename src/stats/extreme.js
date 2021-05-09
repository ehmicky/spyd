// Measures usually contain some very slow outliers due to background processes
// or engine optimization.
// Those are useful to know as they indicate:
//  - worst-case scenarios (`min`, `max`, `quantiles`)
//  - average performance when repeated (`mean`)
// However, those are not good when determining the normal distribution of
// measures:
//  - they create a distribution with a very long tail, which is hard to
//    visualize with `histogram`
//  - they make `stdev`, `rstdev`, `moe` and `rmoe` must less useful
// For the later cases, we remove those outliers.
// We also remove the fastest outliers for similar reasons, although they are
// less frequent.
// We apply those percentage without cloning the `measures` array, for
// performance and memory reasons.
export const getExtremes = function (measures) {
  const loops = measures.length - 1
  const [min] = measures
  const max = measures[loops]
  const { lowIndex, highIndex, length } = getLengthFromLoops(loops)
  const low = measures[lowIndex]
  const high = measures[highIndex]
  return { min, max, lowIndex, highIndex, length, low, high }
}

// `Math.round()` rounds towards +Inf, which is what we want:
//  - This ensures both low and high outliers are not removed at the same time,
//    which would mean adding one `measure` could potentially remove one from
//    `length`
//  - This makes outliers removal start twice faster. For example, with 5%
//    outliers on each end, this starts after 10 loops, not 20.
export const getLengthFromLoops = function (loops) {
  const lowIndex = Math.round(loops * LOW_OUTLIERS)
  const highIndex = Math.round(loops * HIGH_OUTLIERS)
  const length = highIndex - lowIndex + 1
  return { lowIndex, highIndex, length }
}

// Inverse function of `getLengthFromLoops()`, i.e. retrieves `loops` from
// `length`. Due to the use of multiple `Math.round()`, the result might be
// 1 lower|higher than the actual result.
export const getLoopsFromLength = function (length) {
  return Math.round(length / (HIGH_OUTLIERS - LOW_OUTLIERS)) - 1
}

// A higher value makes histograms give less information about very low/high
// values.
// A lower value makes it more likely for outliers to overtake the histogram,
// concentrating most of the values into far fewer buckets.
const LOW_OUTLIERS = 0.05
// Having the same percentage for slow/fast outliers ensures the `median`
// remains the same.
const HIGH_OUTLIERS = 1 - LOW_OUTLIERS
