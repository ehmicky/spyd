import { isDeepStrictEqual } from 'node:util'

import { isSameArray } from './equal.js'

// Remove duplicate elements using a deep comparison.
// Uses imperative code for performance.
// Avoids creating intermediary arrays for memory.
export const uniqueDeep = (array) =>
  array.filter(isUniqueValue.bind(undefined, isDeepStrictEqual))

// Same except arrays are compared as if they were unordered
export const uniqueDeepUnordered = (array) =>
  array.filter(isUniqueValue.bind(undefined, isSameArray))

// eslint-disable-next-line max-params
const isUniqueValue = (isEqual, value, valueIndex, array) => {
  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = valueIndex + 1; index < array.length; index += 1) {
    const valueB = array[index]

    // eslint-disable-next-line max-depth
    if (isEqual(value, valueB)) {
      return false
    }
  }

  return true
}
