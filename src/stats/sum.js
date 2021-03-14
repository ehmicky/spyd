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
  if (median === 0) {
    return 0
  }

  const variance = getVariance(array, median)
  return Math.sqrt(variance) / median
}

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
