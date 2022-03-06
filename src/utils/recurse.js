import isPlainObj from 'is-plain-obj'

import { mapValues } from './map.js'

// Apply a mapping function over all values of an object or array.
// Only recurse over arrays and plain objects.
// eslint-disable-next-line max-params
export const recurseValues = function (
  value,
  mapper,
  isRecurseObject = isPlainObj,
  path = [],
) {
  const valueA = mapper(value, path)

  if (Array.isArray(valueA)) {
    return valueA.map((child, index) =>
      recurseValues(child, mapper, isRecurseObject, [...path, index]),
    )
  }

  if (isRecurseObject(valueA)) {
    return mapValues(valueA, (child, key) =>
      recurseValues(child, mapper, isRecurseObject, [...path, key]),
    )
  }

  return valueA
}

// Find properties matching a specific condition
export const findValues = function (value, condition, isRecurseObject) {
  const paths = []
  recurseValues(
    value,
    addPath.bind(undefined, { paths, condition }),
    isRecurseObject,
  )
  return paths
}

const addPath = function ({ paths, condition }, value, path) {
  if (condition(value)) {
    // eslint-disable-next-line fp/no-mutating-methods
    paths.push({ path, value })
  }

  return value
}
