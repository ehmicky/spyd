import { mergeSort } from './merge.js'
import { getQuantiles, getQuantile } from './quantile.js'
import { sortFloats } from './sort.js'

// Retrieve an approximate median of an unsorted array which is incrementally
// growing. Each increment results in a new subarray to concatenate.
// We compute an approximate median for each subarray and store it in a
// collection of approximate medians. We return the median of that collection.
// This is imprecise but much faster than other ways to retrieve the median of
// an incrementally growing array.
// `divideBy` is a performance optimization when the array elements need to be
// divided. It only divides once instead of having to iterate through the array.
// A lower `precision` will make the return value vary more.
// A higher `precision` will increase the time to sort by `O(n * log(n))`
export const getMediansMedian = function ({
  medians,
  array,
  precision,
  divideBy = 1,
}) {
  const approximateMedian = getApproximateMedian(array, precision)
  const newMedian = approximateMedian / divideBy
  return getIncrementalMedian(medians, newMedian)
}

// Retrieve a value close to the real median in an unsorted array.
// Faster than `getMedian()` but not perfectly accurate.
const getApproximateMedian = function (array, precision) {
  const samples =
    array.length > precision + 1
      ? getQuantiles(array, precision, 1)
      : [...array]
  sortFloats(samples)
  return getMedian(samples)
}

// Get median of an incrementally growing array
export const getIncrementalMedian = function (array, value) {
  mergeSort(array, [value])
  return getMedian(array)
}

// Retrieve median of an array of floats.
// Array must be sorted and not empty.
export const getMedian = function (array) {
  return getQuantile(array, MEDIAN_QUANTILE)
}

const MEDIAN_QUANTILE = 0.5
