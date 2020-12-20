import { binarySearch } from './binary_search.js'

// Retrieve histogram of an array of floats.
// Array must be sorted and not empty.
export const getHistogram = function (array, bucketCount) {
  const [min] = array
  const max = array[array.length - 1]
  const bucketSize = (max - min) / bucketCount

  const bucketIndexes = Array.from({ length: bucketCount }, getBucketIndex)
  const { buckets } = bucketIndexes.reduce(
    addBucket.bind(undefined, { array, bucketSize, bucketCount, min, max }),
    { buckets: [], lastHighIndex: -1, lastHigh: min },
  )
  return buckets
}

const getBucketIndex = function (value, index) {
  return index
}

const addBucket = function (
  { array, bucketSize, bucketCount, min, max },
  { buckets, lastHighIndex, lastHigh },
  bucketIndex,
) {
  // Avoids float precision roundoff error at the end by using `max` directly
  const high =
    bucketIndex + 1 === bucketCount ? max : min + (bucketIndex + 1) * bucketSize

  const highIndex = binarySearch(array, high, lastHighIndex)
  const bucketsCount = highIndex - lastHighIndex
  const frequency = bucketsCount / array.length

  // Directly mutate for performance
  // eslint-disable-next-line fp/no-mutating-methods
  buckets.push([lastHigh, high, frequency])

  return { buckets, lastHighIndex: highIndex, lastHigh: high }
}
