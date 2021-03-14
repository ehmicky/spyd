// Retrieve arithmetic mean of an array of floats (cannot be NaN nor Infinite).
// Array must not be empty.
export const getMean = function (array) {
  return getSum(array) / array.length
}

// Retrieve sum of array of floats.
export const getSum = function (array) {
  // eslint-disable-next-line fp/no-let
  let sum = 0

  // eslint-disable-next-line fp/no-loops
  for (const element of array) {
    // eslint-disable-next-line fp/no-mutation
    sum += element
  }

  return sum
}
