import isPlainObj from 'is-plain-obj'

import { list } from '../config/normalize/lib/wild_wild_path/main.js'

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

// Find leaf properties matching a specific condition.
// We make sure to use options which match which object gets recursed or not by
// the deep merging logic.
export const findValues = function (value, condition) {
  return list(value, '**', { leaves: true, entries: true }).filter(condition)
}
