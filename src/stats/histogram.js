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
  const bucketIndexes = Array.from({ length: bucketCount }, getBucketIndex)
  const state = { startIndex: lowIndex - 1 }
  const { buckets } = bucketIndexes.reduce(
    addBucket.bind(undefined, { array, bucketEdges, highIndex, length, state }),
    { buckets: [] },
  )
  return buckets
}

const getBucketEdges = function (low, high, bucketCount) {
  const bucketSize = (high - low) / bucketCount
  const bucketEdges = Array.from(
    { length: bucketCount },
    (value, bucketIndex) => low + bucketIndex * bucketSize,
  )
  // Avoids float precision roundoff error at the end by using `high` directly
  return [...bucketEdges, high]
}

const getBucketIndex = function (value, bucketIndex) {
  return bucketIndex
}

const addBucket = function (
  { array, highIndex, bucketEdges, length, state, state: { startIndex } },
  { buckets },
  bucketIndex,
) {
  const start = bucketEdges[bucketIndex]
  const end = bucketEdges[bucketIndex + 1]

  const endIndex = binarySearch(array, end, startIndex, highIndex)
  const bucketsCount = endIndex - startIndex
  const frequency = bucketsCount / length

  // Directly mutate for performance
  // eslint-disable-next-line fp/no-mutating-methods
  buckets.push({ start, end, frequency })

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  state.startIndex = endIndex

  return { buckets }
}

