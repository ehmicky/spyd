import isPlainObj from 'is-plain-obj'

import { mapValues } from './map.js'

// Apply a mapping function over all values of an object or array.
// Only recurse over arrays and plain objects.
export const recurseValues = function (value, mapper) {
  const valueA = mapper(value)

  if (isPlainObj(valueA)) {
    return mapValues(valueA, (child) => recurseValues(child, mapper))
  }

  if (Array.isArray(valueA)) {
    return valueA.map((child) => recurseValues(child, mapper))
  }

  return valueA
}
