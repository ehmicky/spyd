// Retrieve standard deviation of an array of floats (cannot be NaN/Infinity).
// Array must not be empty.
// We use the median, not the mean, because it is more stable and is privileged
// in reporting.
// We use the absolute standard deviation, as opposed to making it relative to
// the median (as a percentage)
//  - It makes it easier to understand:
//     - the spread of a given combination
//     - its relation to moe and distribution-related stats such as percentiles
//       (that are also not percentages)
//  - On the flipside, it makes it harder to compare combinations (since they
//    most likely have different medians)
export const getStdev = function ({ array, lowIndex, highIndex, median }) {
  const length = highIndex - lowIndex + 1

  if (median === 0 || length < MIN_DEVIATION_LOOPS) {
    return
  }

  const variance =
    getSumDeviation({ array, lowIndex, highIndex, median }) / (length - 1)
  return Math.sqrt(variance)
}

// The standard deviation might be very imprecise when there are not enough
// values to compute it from.
// A higher value makes standard deviation less likely to be computed for very
// slow tasks.
// A lower value makes it more likely to use inaccurate standard deviations.
const MIN_DEVIATION_LOOPS = 5

// We use a separate function from `getSum()` because it is much more performant
const getSumDeviation = function ({ array, lowIndex, highIndex, median }) {
  // eslint-disable-next-line fp/no-let
  let sum = 0

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = lowIndex; index <= highIndex; index += 1) {
    // eslint-disable-next-line fp/no-mutation
    sum += (array[index] - median) ** 2
  }

  return sum
}
