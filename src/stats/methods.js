// Retrieve median of an array of floats.
// Array must be sorted.
// Returns NaN when array is empty.
export const getMedian = function(array) {
  if (array.length % 2 === 1) {
    return array[(array.length - 1) / 2]
  }

  return (array[array.length / 2 - 1] + array[array.length / 2]) / 2
}

// Retrieve arithmetic mean of an array of floats (cannot be NaN nor Infinite).
// Returns Infinity when array is empty.
export const getMean = function(array) {
  return array.reduce(addNumbers, 0) / array.length
}

const addNumbers = function(numA, numB) {
  return numA + numB
}

// Retrieve variance of an array of floats (cannot be NaN nor Infinite).
// Returns Infinity when array is empty.
export const getVariance = function(array, mean) {
  return getMean(array.map(num => (num - mean) ** 2))
}

// Same as variance but for standard deviation
export const getDeviation = function(variance) {
  return Math.sqrt(variance)
}
