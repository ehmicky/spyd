// Retrieve arithmetic mean of an array of floats (cannot be NaN nor Infinite).
// Array must not be empty.
export const getMean = function (array) {
  return getSum(array) / array.length
}

// Retrieve sum of array of floats.
export const getSum = function (array) {
  return array.reduce(addNumbers, 0)
}

const addNumbers = function (numA, numB) {
  return numA + numB
}

// Retrieve standard deviation of an array of floats (cannot be NaN/Infinity).
// In percentage relative to the mean.
// Array must not be empty.
export const getDeviation = function (array, mean) {
  if (mean === 0) {
    return 0
  }

  const variance = getMean(array.map((num) => (num - mean) ** 2))
  return Math.sqrt(variance) / mean
}
