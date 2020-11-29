import { getQuantiles, getQuantile } from './quantiles.js'
import { sortNumbers } from './sort.js'

// Retrieve median of an array of floats.
// Array must be sorted and not empty.
export const getSortedMedian = function (array, threshold) {
  return getQuantile(array, MEDIAN_QUANTILE, threshold)
}

const MEDIAN_QUANTILE = 0.5

// Retrieve a value close to the real median in an unsorted array.
// Faster than `getMedian()` but not perfectly accurate.
export const getUnsortedMedian = function (array, length, threshold) {
  const samples =
    array.length > length + 1 ? getQuantiles(array, length, 1) : [...array]
  sortNumbers(samples)
  return getSortedMedian(samples, threshold)
}
