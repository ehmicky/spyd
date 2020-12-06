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
