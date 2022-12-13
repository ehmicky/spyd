// Retrieve arithmetic mean of an array of floats (cannot be NaN nor Infinite).
// Array must not be empty.
export const getMean = (
  array,
  { minIndex = 0, maxIndex = array.length - 1 } = {},
) => {
  const length = maxIndex - minIndex + 1
  return getSum(array, minIndex, maxIndex) / length
}

// Retrieve sum of array of floats.
export const getSum = (array, minIndex, maxIndex) => {
  // eslint-disable-next-line fp/no-let
  let sum = 0

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = minIndex; index <= maxIndex; index += 1) {
    // eslint-disable-next-line fp/no-mutation
    sum += array[index]
  }

  return sum
}
