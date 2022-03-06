import isPlainObj from 'is-plain-obj'

import { isAnyToken } from './parsing/any.js'
import {
  convertIndexInteger,
  convertIndexString,
  getArrayIndex,
  isIndexToken,
} from './parsing/array.js'
import { serialize } from './parsing/serialize.js'

// List all values (and their associated path) matching a specific query for
// on specific target value.
export const listExistingEntries = function (target, path) {
  return listEntries(target, path).filter(isNotMissing)
}

const isNotMissing = function ({ missing }) {
  return !missing
}

export const listEntries = function (target, path) {
  return path.reduce(listTokenEntries, [{ value: target, path: [] }])
}

const listTokenEntries = function (entries, token) {
  return entries.flatMap((entry) => getTokenEntries(entry, token))
}

const getTokenEntries = function ({ value, path }, token) {
  return isAnyToken(token)
    ? getAnyEntries(value, path)
    : getKeyEntries(value, path, token)
}

// For queries which use * on its own, e.g. `a.*`
// We purposely ignore symbol properties by using `Object.entries()`.
const getAnyEntries = function (value, path) {
  if (Array.isArray(value)) {
    return value.map((childValue, index) => ({
      value: childValue,
      path: [...path, index],
      missing: false,
    }))
  }

  if (isRecurseObject(value)) {
    return Object.entries(value).map(([childKey, childValue]) => ({
      value: childValue,
      path: [...path, childKey],
      missing: false,
    }))
  }

  return []
}

// For queries which do not use *, e.g. `a.b` or `a.1`
const getKeyEntries = function (value, path, token) {
  const { value: valueA, missing } = handleMissingValue(value, token)

  if (Array.isArray(valueA)) {
    const index = convertIndexInteger(token)
    const indexA = getArrayIndex(valueA, index)
    return [{ value: valueA[indexA], path: [...path, indexA], missing }]
  }

  const propName = convertIndexString(token)
  return [{ value: valueA[propName], path: [...path, propName], missing }]
}

// When the value does not exist, we set it deeply with `set()` but not with
// `list|get|has()`.
// We filter out between those two cases using a `missing` property.
// Tokens like wildcards cannot do this since there is known property to add.
// Array indices that are:
//  - Positive are kept
//  - Negative are converted to index 0
export const handleMissingValue = function (value, token) {
  const missing = !Array.isArray(value) && !isRecurseObject(value)
  const valueA = missing ? getMissingValue(token) : value
  return { value: valueA, missing }
}

const getMissingValue = function (token) {
  return isIndexToken(token) ? [] : {}
}

// Whether a property is considered an object that can:
//  - Be recursed over
//  - Be cloned with `{...}`
//     - Therefore we do not allow class instances
// This must return `false` for arrays.
const isRecurseObject = function (value) {
  return isPlainObj(value)
}

// Compute all entries properties from the basic ones
export const normalizeEntry = function ({ value, path }) {
  const query = serialize(path)
  return { value, path, query }
}
