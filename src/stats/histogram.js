import { binarySearch } from './binary_search.js'

// Retrieve histogram of an array of floats.
// Array must be sorted and not empty.
export const getHistogram = function ({
  array,
  minIndex,
  maxIndex,
  length,
  bucketCount,
}) {
  const min = array[minIndex]
  const max = array[maxIndex]
  const state = { startIndex: minIndex - 1 }

  return getBucketEdges(min, max, bucketCount).map(([start, end]) =>
    getBucket({ start, end, array, maxIndex, length, state }),
  )
}

// Retrieve buckets `start` and `end`
export const getBucketEdges = function (min, max, bucketCount) {
  const bucketSize = (max - min) / bucketCount
  return Array.from({ length: bucketCount }, (value, bucketIndex) => [
    getBucketEdge(bucketIndex, { min, max, bucketCount, bucketSize }),
    getBucketEdge(bucketIndex + 1, { min, max, bucketCount, bucketSize }),
  ])
}

// Avoids float precision roundoff error at the end by using `max` directly
const getBucketEdge = function (
  bucketIndex,
  { min, max, bucketCount, bucketSize },
) {
  return bucketIndex === bucketCount ? max : min + bucketIndex * bucketSize
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
