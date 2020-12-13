import { getOutliersMax } from './outliers.js'
import { sortFloats } from './sort.js'

// Retrieve quantiles of an array of floats.
// Array must be sorted and not empty.
export const getQuantiles = function (array, length, threshold) {
  return Array.from({ length: length + 1 }, (value, index) =>
    getQuantile(array, index / length, threshold),
  )
}

const getQuantile = function (array, percentage, threshold) {
  const outliersMax = getOutliersMax(array, threshold)
  const position = (outliersMax - 1) * percentage

  if (Number.isInteger(position)) {
    return array[position]
  }

  return (
    array[Math.floor(position)] * (Math.ceil(position) - position) +
    array[Math.ceil(position)] * (position - Math.floor(position))
  )
}

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
  sortFloats(samples)
  return getSortedMedian(samples, threshold)
}
