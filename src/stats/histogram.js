import { binarySearch } from './binary_search.js'

// Retrieve histogram of an array of floats.
// Array must be sorted and not empty.
export const getHistogram = function ({
  array,
  lowIndex,
  highIndex,
  bucketCount,
}) {
  const length = highIndex - lowIndex + 1
  const low = array[lowIndex]
  const high = array[highIndex]

  const bucketEdges = getBucketEdges(low, high, bucketCount)

  const state = { startIndex: lowIndex - 1 }
  return Array.from({ length: bucketCount }, (value, bucketIndex) =>
    getBucket({ bucketIndex, array, bucketEdges, highIndex, length, state }),
  )
}

const getBucketEdges = function (low, high, bucketCount) {
  const bucketSize = (high - low) / bucketCount
  return Array.from({ length: bucketCount }, (value, bucketIndex) =>
    getBucketEdgesPair({ bucketIndex, low, high, bucketCount, bucketSize }),
  )
}

const getBucketEdgesPair = function ({
  bucketIndex,
  low,
  high,
  bucketCount,
  bucketSize,
}) {
  return {
    start: getBucketEdge(bucketIndex, { low, high, bucketCount, bucketSize }),
    end: getBucketEdge(bucketIndex + 1, {
      low,
      high,
      bucketCount,
      bucketSize,
    }),
  }
}

// Avoids float precision roundoff error at the end by using `high` directly
const getBucketEdge = function (
  bucketIndex,
  { low, high, bucketCount, bucketSize },
) {
  return bucketIndex === bucketCount ? high : low + bucketIndex * bucketSize
}

const getBucket = function ({
  bucketIndex,
  array,
  highIndex,
  bucketEdges,
  length,
  state,
  state: { startIndex },
}) {
  const { start, end } = bucketEdges[bucketIndex]

  const endIndex = binarySearch(array, end, startIndex, highIndex)
  const frequency = (endIndex - startIndex) / length

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  state.startIndex = endIndex

  return { start, end, frequency }
}

