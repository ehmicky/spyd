// Retrieve median of a sorted array
export const getMedian = function(array) {
  if (array.length % 2 === 1) {
    return array[(array.length - 1) / 2]
  }

  return (array[array.length / 2 - 1] + array[array.length / 2]) / 2
}

export const getMean = function(array) {
  return array.reduce(addNumbers, 0) / array.length
}

const addNumbers = function(numA, numB) {
  return numA + numB
}

export const getVariance = function(array, mean) {
  return getMean(array.map(num => (num - mean) ** 2))
}

export const getDeviation = function(variance) {
  return Math.sqrt(variance)
}
