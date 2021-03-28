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
  const min = array[lowIndex]
  const max = array[highIndex]
  const bucketSize = (max - min) / bucketCount

  const bucketIndexes = getBucketIndexes({ min, max, bucketCount, bucketSize })
  const { buckets } = bucketIndexes.reduce(
    addBucket.bind(undefined, { array, highIndex, length }),
    { buckets: [], startIndex: lowIndex - 1 },
  )
  return buckets
}

const getBucketIndexes = function ({ min, max, bucketCount, bucketSize }) {
  return Array.from({ length: bucketCount }, (value, bucketIndex) =>
    getBucketIndex({ bucketIndex, min, max, bucketCount, bucketSize }),
  )
}

const getBucketIndex = function ({
  bucketIndex,
  min,
  max,
  bucketCount,
  bucketSize,
}) {
  const start = getBucketEdge(bucketIndex - 1, {
    min,
    max,
    bucketCount,
    bucketSize,
  })
  const end = getBucketEdge(bucketIndex, { min, max, bucketCount, bucketSize })
  return { start, end }
}

// Avoids float precision roundoff error at the end by using `max` directly
const getBucketEdge = function (
  bucketIndex,
  { min, max, bucketCount, bucketSize },
) {
  return bucketIndex + 1 === bucketCount
    ? max
    : min + (bucketIndex + 1) * bucketSize
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

