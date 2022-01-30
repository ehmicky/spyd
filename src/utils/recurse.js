import isPlainObj from 'is-plain-obj'

import { mapValues } from './map.js'

// Apply a mapping function over all leaf values of an object or array.
// Only recurse over arrays and plain objects.
export const recurseValues = function (value, mapper) {
  if (isPlainObj(value)) {
    return mapValues(value, (child) => recurseValues(child, mapper))
  }

  if (Array.isArray(value)) {
    return value.map((child) => recurseValues(child, mapper))
  }

  return mapper(value)
}
