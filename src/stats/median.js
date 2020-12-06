import { getQuantiles } from './quantiles.js'
import { sortNumbers } from './sort.js'

// Retrieve median of an array of floats.
// Array must be sorted and not empty.
export const getSortedMedian = function (array) {
  if (array.length % 2 === 1) {
    return array[(array.length - 1) / 2]
  }

  return (array[array.length / 2 - 1] + array[array.length / 2]) / 2
}

// Retrieve a value close to the real median in an unsorted array.
// Faster than `getMedian()` but not perfectly accurate.
export const getUnsortedMedian = function (array, length) {
  const samples =
    array.length > length ? getQuantiles(array, length) : [...array]
  sortNumbers(samples)
  return getSortedMedian(samples)
}
