// Retrieve arithmetic mean of an array of floats (cannot be NaN nor Infinite).
// Array must not be empty.
export const getMean = function (array) {
  return getSum(array) / array.length
}

// Retrieve sum of array of floats.
export const getSum = function (array) {
  // eslint-disable-next-line fp/no-let
  let sum = 0

  // eslint-disable-next-line fp/no-loops
  for (const element of array) {
    // eslint-disable-next-line fp/no-mutation
    sum += element
  }

  return sum
}

// Retrieve standard deviation of an array of floats (cannot be NaN/Infinity).
// In percentage relative to the median.
// We use the median, not the mean, because it is more stable and is privileged
// in reporting.
// Array must not be empty.
export const getDeviation = function (array, median) {
  if (median === 0 || array.length < MIN_DEVIATION_LOOPS) {
    return
  }

  const variance = getVariance(array, median)
  return Math.sqrt(variance) / median
}

// The standard deviation might be very imprecise when there are not enough
// values to compute it from.
// A higher value makes standard deviation less likely to be computed for very
// slow tasks.
// A lower value makes it more likely to use inaccurate standard deviations.
const MIN_DEVIATION_LOOPS = 5

const getVariance = function (array, median) {
  return getSumDeviation(array, median) / array.length
}

// We use a separate function from `getSum()` because it is much more performant
const getSumDeviation = function (array, median) {
  // eslint-disable-next-line fp/no-let
  let sum = 0

  // eslint-disable-next-line fp/no-loops
  for (const element of array) {
    // eslint-disable-next-line fp/no-mutation
    sum += (element - median) ** 2
  }

  return sum
}

// Retrieve standard error
export const getStandardError = function (array, deviation) {
  if (deviation === undefined) {
    return
  }

  return deviation / Math.sqrt(array.length)
}
