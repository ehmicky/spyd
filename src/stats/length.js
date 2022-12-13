// Apply outliers removal.
// Instead of slicing the array, we are keeping track of the minimum|maximum
// index, for performance and memory reasons.
// `Math.round()` rounds towards +Inf:
//  - This makes outliers removal start twice faster. For example, with 5%
//    outliers on each end, this starts after 10 loops, not 20.
// We remove 1 from `loops` when computing the number of max outliers:
//  - This ensures both low and high outliers are not removed at the same time,
//    which would mean adding one `measure` could potentially remove one from
//    `length`
export const getLengthFromLoops = (loops, outliersMin, outliersMax) => {
  const minIndex = Math.round(loops * outliersMin)
  const maxIndex = loops - 1 - Math.round((loops - 1) * outliersMax)
  const length = maxIndex - minIndex + 1
  return { minIndex, maxIndex, length }
}

// Inverse function of `getLengthFromLoops()`, i.e. retrieves `loops` from
// `length`. Due to the use of multiple `Math.round()`, the result might be
// 1 lower|higher than the actual result.
export const getLoopsFromLength = (length, outliersMin, outliersMax) =>
  Math.round(length / (1 - outliersMax - outliersMin))
