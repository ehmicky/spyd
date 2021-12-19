// Retrieve all variance-related stats.
// Rstdev is stdev relative to the mean.
// This is more useful than stdev when comparing different combinations, or when
// targetting a specific precision threshold.
export const getVarianceStats = function (array, { minIndex, maxIndex, mean }) {
  const variance = getVariance(array, { minIndex, maxIndex, mean })
  const stdev = Math.sqrt(variance)
  const rstdev = stdev / mean
  return { variance, stdev, rstdev }
}

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
