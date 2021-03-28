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

  const bucketIndexes = getBucketIndexes(low, high, bucketCount)
  const { buckets } = bucketIndexes.reduce(
    addBucket.bind(undefined, { array, highIndex, length }),
    { buckets: [], startIndex: lowIndex - 1 },
  )
  return buckets
}

const getBucketIndexes = function (low, high, bucketCount) {
  const bucketSize = (high - low) / bucketCount
  return Array.from({ length: bucketCount }, (value, bucketIndex) =>
    getBucketIndex({ bucketIndex, low, high, bucketCount, bucketSize }),
  )
}

const getBucketIndex = function ({
  bucketIndex,
  low,
  high,
  bucketCount,
  bucketSize,
}) {
  const start = getBucketEdge(bucketIndex - 1, {
    low,
    high,
    bucketCount,
    bucketSize,
  })
  const end = getBucketEdge(bucketIndex, { low, high, bucketCount, bucketSize })
  return { start, end }
}

// Avoids float precision roundoff error at the end by using `high` directly
const getBucketEdge = function (
  bucketIndex,
  { low, high, bucketCount, bucketSize },
) {
  return bucketIndex + 1 === bucketCount
    ? high
    : low + (bucketIndex + 1) * bucketSize
}

const addBucket = function (
  { array, highIndex, length },
  { buckets, startIndex },
  { start, end },
) {
  const endIndex = binarySearch(array, end, startIndex, highIndex)
  const bucketsCount = endIndex - startIndex
  const frequency = bucketsCount / length

  // Directly mutate for performance
  // eslint-disable-next-line fp/no-mutating-methods
  buckets.push({ start, end, frequency })

  return { buckets, startIndex: endIndex }
}

