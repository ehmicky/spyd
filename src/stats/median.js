import { mergeSort } from './merge.js'
import { getQuantile } from './quantile.js'
import { sortFloats } from './sort.js'

// Get median of an incrementally growing array
export const getIncrementalMedian = function (array, value) {
  mergeSort(array, [value])
  return getMedian(array)
}

export const getUnsortedMedian = function (array) {
  sortFloats(array)
  return getMedian(array)
}

// Retrieve median of an array of floats.
// Array must be sorted and not empty.
export const getMedian = function (array) {
  return getQuantile(array, MEDIAN_QUANTILE)
}

const MEDIAN_QUANTILE = 0.5
