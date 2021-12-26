import { isDeepStrictEqual } from 'util'

// Remove duplicate elements using a deep comparison.
// Uses imperative code for performance.
// Avoids creating intermediary arrays for memory.
export const uniqueDeep = function (array) {
  return array.filter(isUniqueDeep)
}

const isUniqueDeep = function (value, valueIndex, array) {
  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = valueIndex + 1; index < array.length; index += 1) {
    const valueB = array[index]

    // eslint-disable-next-line max-depth
    if (isDeepStrictEqual(value, valueB)) {
      return false
    }
  }

  return true
}
