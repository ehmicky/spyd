// Retrieve arithmetic mean of an array of floats (cannot be NaN nor Infinite).
// Array must not be empty.
export const getMean = function (array) {
  return getSum(array) / array.length
}

// Retrieve sum of array of floats.
const getSum = function (array) {
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
// In percentage relative to the mean.
// Array must not be empty.
export const getDeviation = function (array, mean) {
  if (mean === 0) {
    return 0
  }

  const variance = getVariance(array, mean)
  return Math.sqrt(variance) / mean
}

const getVariance = function (array, mean) {
  return getSumDeviation(array, mean) / array.length
}

// We use a separate function from `getSum()` because it is much more performant
const getSumDeviation = function (array, mean) {
  // eslint-disable-next-line fp/no-let
  let sum = 0

  // eslint-disable-next-line fp/no-loops
  for (const element of array) {
    // eslint-disable-next-line fp/no-mutation
    sum += (element - mean) ** 2
  }

  return sum
}
