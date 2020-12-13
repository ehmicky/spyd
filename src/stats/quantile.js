import { mergeSort } from './merge.js'
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
export const getMedian = function (array, threshold) {
  return getQuantile(array, MEDIAN_QUANTILE, threshold)
}

const MEDIAN_QUANTILE = 0.5

// Get median of an incrementally growing array
export const getIncrementalMedian = function (array, value) {
  mergeSort(array, [value])
  return getMedian(array, 1)
}

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
  threshold,
  divideBy = 1,
}) {
  const approximateMedian = getApproximateMedian(array, precision, threshold)
  const newMedian = approximateMedian / divideBy
  return getIncrementalMedian(medians, newMedian)
}

// Retrieve a value close to the real median in an unsorted array.
// Faster than `getMedian()` but not perfectly accurate.
const getApproximateMedian = function (array, precision, threshold) {
  const samples =
    array.length > precision + 1
      ? getQuantiles(array, precision, 1)
      : [...array]
  sortFloats(samples)
  return getMedian(samples, threshold)
}
