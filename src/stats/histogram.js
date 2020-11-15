// Retrieve histogram of an array of floats.
// Array must be sorted.
export const getHistogram = function (array, bucketsNumber) {
  const [min] = array
  const max = array[array.length - 1]
  const bucketSize = (max - min) / bucketsNumber

  const arrayLength = array.length
  const arrayCopy = array.slice()

  return Array.from({ length: bucketsNumber }, (value, index) =>
    getBucket({
      index,
      array: arrayCopy,
      arrayLength,
      min,
      bucketSize,
      bucketsNumber,
    }),
  )
}

const getBucket = function ({
  index,
  array,
  arrayLength,
  min,
  bucketSize,
  bucketsNumber,
}) {
  const low = min + bucketSize * index
  const high = low + bucketSize
  const bucketCount = getBucketCount({ index, array, bucketsNumber, high })
  const frequency = bucketCount / arrayLength
  return [low, high, frequency]
}

const getBucketCount = function ({ index, array, bucketsNumber, high }) {
  if (index === bucketsNumber - 1) {
    return array.length
  }

  const count = array.findIndex((number) => number >= high)
  // Performance optimization so that `array.findIndex()` is twice faster
  // eslint-disable-next-line fp/no-mutating-methods
  array.splice(0, count)
  return count
}
