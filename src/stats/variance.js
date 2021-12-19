// Retrieve all variance-related stats.
// Rstdev is stdev relative to the mean.
// This is more useful than stdev when comparing different combinations, or when
// targetting a specific precision threshold.
export const getVarianceStats = function (
  array,
  { minIndex, maxIndex, min, max, mean },
) {
  const variance =
    min === max
      ? getIdenticalVariance({ minIndex, maxIndex, mean })
      : getVariance(array, { minIndex, maxIndex, mean })
  const stdev = Math.sqrt(variance)
  const rstdev = stdev / mean
  return { variance, stdev, rstdev }
}

// All measures are sometimes identical due to:
//  - Low time resolution
//  - Custom units
//  - Boolean units
// However, this leads to `variance` being 0, which:
//  - Ends the benchmark too early
//  - Leads to poorer `diffPrecise`
// We fix this by using the `variance` of the measures as if the next measure
// was not identical:
//  - Because if the `variance` is still low enough for benchmark to end, then
//    it is not worth computing that extra measure, i.e. continuing the
//    benchmark
//  - Also, if the following measures are not identical, the difference of
//    `variance` will be minimal, ensuring a smooth transition
// The hypothetical, non-identical next measure is computed to be a small
// percentage away for the identical measure
//  - We use a relative percentage instead of an absolute value like `1` because
//     - It is unitless, giving the same results regardless of the `mean`
//       magnitude
//     - It works well with floats
// Outliers are excluded from this logic, i.e. they might not match the
// identical measures
//  - Therefore, we detect this situation with `min === max`
const getIdenticalVariance = function ({ minIndex, maxIndex, mean }) {
  const sumDeviation = getIdenticalSumDeviation(mean)
  return computeVariance(sumDeviation, minIndex, maxIndex + 1)
}

// This is like `getSumDeviation()` with an array of repeated measures plus
// an additional, slightly different one.
// Since repeated measures have `0` deviations, we can simplify the formula.
const getIdenticalSumDeviation = function (mean) {
  return (mean * IDENTICAL_VARIANCE_SHIFT) ** 2
}

// Relative percentage of shift between the repeated measure and the additional
// one.
// A higher value makes identical measures end too early.
// A lower value makes benchmarks slower.
const IDENTICAL_VARIANCE_SHIFT = 1e-2

// Retrieve variance of an array of floats (cannot be NaN/Infinity).
// Array must not be empty.
// We use the absolute variance, as opposed to making it relative to the mean
// (as a percentage)
//  - It makes it easier to understand:
//     - the spread of a given combination
//     - its relation to moe and distribution-related stats such as percentiles
//       (that are also not percentages)
//  - On the flipside, it makes it harder to compare combinations (since they
//    most likely have different means)
export const getVariance = function (
  array,
  { minIndex = 0, maxIndex = array.length - 1, mean },
) {
  const sumDeviation = getSumDeviation({ array, minIndex, maxIndex, mean })
  return computeVariance(sumDeviation, minIndex, maxIndex)
}

// We use a separate function from `getSum()` because it is much more performant
const getSumDeviation = function ({ array, minIndex, maxIndex, mean }) {
  // eslint-disable-next-line fp/no-let
  let sum = 0

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = minIndex; index <= maxIndex; index += 1) {
    // eslint-disable-next-line fp/no-mutation
    sum += (array[index] - mean) ** 2
  }

  return sum
}

const computeVariance = function (sumDeviation, minIndex, maxIndex) {
  const length = maxIndex - minIndex + 1
  return sumDeviation / (length - 1)
}
