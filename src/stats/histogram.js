import { binarySearch } from './binary_search.js'

// Retrieve histogram of an array of floats or integers.
// Array must be sorted and not empty.
export const getHistogram = (array, { minIndex, maxIndex, bucketCount }) => {
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
const arrayHasIntegers = (array, minIndex, length) => {
  const strideLength = length / INTEGER_CHECK_LENGTH
  const strideIndexes = Array.from(
    { length: INTEGER_CHECK_LENGTH },
    (_, index) => getStrideIndex(index, minIndex, strideLength),
  )
  return strideIndexes.every((strideIndex) =>
    Number.isInteger(array[strideIndex]),
  )
}

// For performance, we do not check every element to confirm the array uses
// integers
const INTEGER_CHECK_LENGTH = 100

const getStrideIndex = (index, minIndex, strideLength) =>
  Math.floor(minIndex + index * strideLength)

// Retrieve buckets `start` and `end`
const getBucketEdges = ({ min, max, bucketCount, hasIntegers }) => {
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
const getBucketEdge = (bucketIndex, { min, max, bucketCount, bucketSize }) =>
  bucketIndex === bucketCount ? max : min + bucketIndex * bucketSize

const roundBucketEdge = ([start, end]) => [start, end].map(Math.floor)

const hasDifferentStartEnd = ([start, end]) => start !== end

const getBucket = ({
  start,
  end,
  array,
  maxIndex,
  length,
  state,
  state: { startIndex },
}) => {
  const endIndex = binarySearch(array, end, startIndex, maxIndex)
  const frequency = (endIndex - startIndex) / length

  state.startIndex = endIndex

  return { start, end, frequency }
}
