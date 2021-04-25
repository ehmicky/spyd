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
export const getStdev = function ({
  array,
  lowIndex,
  highIndex,
  length,
  median,
}) {
  if (median === 0 || length < MIN_STDEV_LOOPS) {
    return
  }

  const variance =
    getSumDeviation({ array, lowIndex, highIndex, median }) / (length - 1)
  return Math.sqrt(variance)
}

// `stdev` might be very imprecise when there are not enough values to compute
// it from. This is a problem since `stdev` is:
//  - Used to compute the `moe`, which is used to know whether to stop
//    measuring. Imprecise `stdev` might lead to stopping measuring too early
//    resulting in imprecise overall results.
//  - Used to estimate the duration left in previews. Due to the preview's
//    smoothing algorithm, imprecise stdev in the first previews have an
//    impact on the next previews.
//  - Reported
// From a statistical standpoint:
//  - T-values counteract the imprecision brought by the low number of loops
//  - So `stdev`/`moe` are statistically significant with a 95% confidence
//    interval even when there are only 2 loops.
//  - However, the 5% of cases outside of that confidence interval have a bigger
//    difference (in average) to the real value, when the number of loops is
//    low. I.e. while the probability of errors is the same, the impact size is
//    bigger.
// A higher value makes standard deviation less likely to be computed for very
// slow tasks.
// A lower value makes it more likely to use imprecise standard deviations.
const MIN_STDEV_LOOPS = 5

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

// Retrieve stdev relative to the median.
// This is more useful than stdev when comparing different combinations, or when
// targetting a specific precision threshold.
export const getRstdev = function (stdev, median) {
  if (stdev === undefined) {
    return
  }

  return stdev / median
}
