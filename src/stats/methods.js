import { getOutliersMax } from './outliers.js'

// Retrieve minimum value.
// Not using destructuring is slightly more performant.
// Array must be sorted and not empty.
export const getMin = function (array) {
  return array[0]
}

// Retrieve maximum value.
// Array must be sorted and not empty.
export const getMax = function (array, threshold) {
  const outliersMax = getOutliersMax(array, threshold)
  return array[outliersMax - 1]
}

// Retrieve arithmetic mean of an array of floats (cannot be NaN nor Infinite).
// Array must not be empty.
export const getMean = function (array, threshold) {
  const outliersMax = getOutliersMax(array, threshold)
  return getSum(array, outliersMax) / outliersMax
}

// Retrieve sum of array of floats.
const getSum = function (array, outliersMax) {
  // eslint-disable-next-line fp/no-let
  let sum = 0

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index < outliersMax; index++) {
    // eslint-disable-next-line fp/no-mutation
    sum += array[index]
  }

  return sum
}

// Retrieve standard deviation of an array of floats (cannot be NaN/Infinity).
// In percentage relative to the mean.
// Array must not be empty.
export const getDeviation = function (array, mean, threshold) {
  if (mean === 0) {
    return 0
  }

  const variance = getVariance(array, mean, threshold)
  return Math.sqrt(variance) / mean
}

const getVariance = function (array, mean, threshold) {
  const outliersMax = getOutliersMax(array, threshold)
  return getSumDeviation(array, mean, outliersMax) / outliersMax
}

// We use a separate function from `getSum()` because it is much more performant
const getSumDeviation = function (array, mean, outliersMax) {
  // eslint-disable-next-line fp/no-let
  let sum = 0

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index < outliersMax; index++) {
    // eslint-disable-next-line fp/no-mutation
    sum += (array[index] - mean) ** 2
  }

  return sum
}
