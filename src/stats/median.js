import { getQuantile } from './quantile.js'
import { sortFloats } from './sort.js'

// Retrieve median of an array of floats.
// Sort array.
export const getUnsortedMedian = function (array) {
  sortFloats(array)
  return getSortedMedian(array)
}

// Same but array must already be sorted.
export const getSortedMedian = function (array) {
  return getQuantile(array, MEDIAN_QUANTILE)
}

const MEDIAN_QUANTILE = 0.5
