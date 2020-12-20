// Returns the index of the last element `<= value` using a binary search.
// `start` must be `< array.length`
// Use imperative code for performance.
// eslint-disable-next-line complexity
export const binarySearch = function (array, value, start = 0) {
  // eslint-disable-next-line fp/no-let
  let end = array.length

  // eslint-disable-next-line fp/no-loops
  do {
    const middle = Math.floor((start + end) / 2)

    // eslint-disable-next-line max-depth
    if (array[middle] > value) {
      // eslint-disable-next-line max-depth
      if (end === middle) {
        return middle
      }

      // eslint-disable-next-line fp/no-mutation
      end = middle
    } else {
      // eslint-disable-next-line max-depth
      if (start === middle) {
        return middle
      }

      // eslint-disable-next-line fp/no-mutation, no-param-reassign
      start = middle
    }
  } while (true)
}
