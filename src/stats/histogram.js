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

  const bucketIndexes = Array.from({ length: bucketCount }, getBucketIndex)
  const { buckets } = bucketIndexes.reduce(
    addBucket.bind(undefined, {
      array,
      highIndex,
      bucketSize,
      bucketCount,
      length,
      min,
      max,
    }),
    { buckets: [], startIndex: lowIndex - 1, startValue: min },
  )
  return buckets
}

const getBucketIndex = function (value, index) {
  return index
}

const addBucket = function (
  { array, highIndex, bucketSize, bucketCount, length, min, max },
  { buckets, startIndex, startValue },
  bucketIndex,
) {
  // Avoids float precision roundoff error at the end by using `max` directly
  const endValue =
    bucketIndex + 1 === bucketCount ? max : min + (bucketIndex + 1) * bucketSize

  const endIndex = binarySearch(array, endValue, startIndex, highIndex)
  const bucketsCount = endIndex - startIndex
  const frequency = bucketsCount / length

  // Directly mutate for performance
  // eslint-disable-next-line fp/no-mutating-methods
  buckets.push([startValue, endValue, frequency])

  return { buckets, startIndex: endIndex, startValue: endValue }
}
