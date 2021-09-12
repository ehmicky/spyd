import { binarySearch } from './binary_search.js'

// Retrieve histogram of an array of floats.
// Array must be sorted and not empty.
export const getHistogram = function (
  array,
  { minIndex, maxIndex, bucketCount },
) {
  const min = array[minIndex]
  const max = array[maxIndex]
  const length = maxIndex - minIndex + 1

  const hasIntegers = arrayHasIntegers(array, minIndex, length)
  const bucketEdges = getBucketEdges({ min, max, bucketCount, hasIntegers })
  const state = { startIndex: minIndex - 1 }
  return bucketEdges.map(([start, end]) =>
    getBucket({ start, end, array, maxIndex, length, state }),
  )
}

// When the array has only integers, bucket edges are rounded to integers
const arrayHasIntegers = function (array, minIndex, length) {
  const strideLength = length / INTEGER_CHECK_LENGTH
  const integerIndexes = Array.from(
    { length: INTEGER_CHECK_LENGTH },
    (_, index) => getIntegerIndex(index, minIndex, strideLength),
  )
  return integerIndexes.every((integerIndex) =>
    Number.isInteger(array[integerIndex]),
  )
}

// For performance, we do not check every element to confirm the array uses
// integers
const INTEGER_CHECK_LENGTH = 100

const getIntegerIndex = function (index, minIndex, strideLength) {
  return Math.floor(minIndex + index * strideLength)
}

// Retrieve buckets `start` and `end`
const getBucketEdges = function ({ min, max, bucketCount, hasIntegers }) {
  const bucketSize = (max - min) / bucketCount

  if (bucketSize === 0) {
    return [[min, max]]
  }

  const edges = Array.from({ length: bucketCount }, (value, bucketIndex) => [
    getBucketEdge(bucketIndex, { min, max, bucketCount, bucketSize }),
    getBucketEdge(bucketIndex + 1, { min, max, bucketCount, bucketSize }),
  ])
  return hasIntegers
    ? edges.map(roundBucketEdge).filter(hasDifferentStartEnd)
    : edges
}

// Avoids float precision roundoff error at the end by using `max` directly
const getBucketEdge = function (
  bucketIndex,
  { min, max, bucketCount, bucketSize },
) {
  return bucketIndex === bucketCount ? max : min + bucketIndex * bucketSize
}

const roundBucketEdge = function ([start, end]) {
  return [start, end].map(Math.floor)
}

const hasDifferentStartEnd = function ([start, end]) {
  return start !== end
}

const getBucket = function ({
  start,
  end,
  array,
  maxIndex,
  length,
  state,
  state: { startIndex },
}) {
  const endIndex = binarySearch(array, end, startIndex, maxIndex)
  const frequency = (endIndex - startIndex) / length

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  state.startIndex = endIndex

  return { start, end, frequency }
}
