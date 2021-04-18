import { binarySearch } from './binary_search.js'

// Retrieve histogram of an array of floats.
// Array must be sorted and not empty.
export const getHistogram = function ({
  array,
  lowIndex,
  highIndex,
  length,
  bucketCount,
}) {
  const low = array[lowIndex]
  const high = array[highIndex]
  const state = { startIndex: lowIndex - 1 }

  return getBucketEdges(low, high, bucketCount).map(([start, end]) =>
    getBucket({ start, end, array, highIndex, length, state }),
  )
}

// Retrieve buckets `start` and `end`
export const getBucketEdges = function (low, high, bucketCount) {
  const bucketSize = (high - low) / bucketCount
  return Array.from({ length: bucketCount }, (value, bucketIndex) => [
    getBucketEdge(bucketIndex, { low, high, bucketCount, bucketSize }),
    getBucketEdge(bucketIndex + 1, { low, high, bucketCount, bucketSize }),
  ])
}

// Avoids float precision roundoff error at the end by using `high` directly
const getBucketEdge = function (
  bucketIndex,
  { low, high, bucketCount, bucketSize },
) {
  return bucketIndex === bucketCount ? high : low + bucketIndex * bucketSize
}

const getBucket = function ({
  start,
  end,
  array,
  highIndex,
  length,
  state,
  state: { startIndex },
}) {
  const endIndex = binarySearch(array, end, startIndex, highIndex)
  const frequency = (endIndex - startIndex) / length

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  state.startIndex = endIndex

  return { start, end, frequency }
}
