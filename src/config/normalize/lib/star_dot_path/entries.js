import isPlainObj from 'is-plain-obj'

import { serialize } from './parsing/serialize.js'
import { isAnyToken } from './parsing/tokens/any.js'
import { getArrayIndex, isIndexToken } from './parsing/tokens/array.js'
import { isRegExpToken } from './parsing/tokens/regexp.js'

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
  if (isAnyToken(token)) {
    return getAnyEntries(value, path)
  }

  if (isRegExpToken(token)) {
    return getRegExpEntries(value, path, token)
  }

  if (isIndexToken(token)) {
    return getIndexEntries(value, path, token)
  }

  return getPropEntries(value, path, token)
}

// For queries which use * on its own, e.g. `a.*`
// We purposely ignore symbol properties by using `Object.keys()`.
const getAnyEntries = function (value, path) {
  if (Array.isArray(value)) {
    return value.map((childValue, index) => ({
      value: childValue,
      path: [...path, index],
      missing: false,
    }))
  }

  if (isRecurseObject(value)) {
    return Object.keys(value).map((childKey) => ({
      value: value[childKey],
      path: [...path, childKey],
      missing: false,
    }))
  }

  return []
}

// For queries which use RegExps, e.g. `a./[bc]/`
const getRegExpEntries = function (value, path, token) {
  if (!isRecurseObject(value)) {
    return []
  }

  return Object.keys(value)
    .filter((childKey) => token.test(childKey))
    .map((childKey) => ({
      value: value[childKey],
      path: [...path, childKey],
      missing: false,
    }))
}

// For index queries, e.g. `a.1`
const getIndexEntries = function (value, path, token) {
  const { value: valueA, missing } = handleIndexMissingValue(value)
  const index = getArrayIndex(valueA, token)
  return [{ value: valueA[index], path: [...path, index], missing }]
}

const handleIndexMissingValue = function (value) {
  const missing = !Array.isArray(value)
  const valueA = missing ? [] : value
  return { value: valueA, missing }
}

// For property name queries, e.g. `a.b`
const getPropEntries = function (value, path, token) {
  const { value: valueA, missing } = handlePropMissingValue(value, token)
  return [{ value: valueA[token], path: [...path, token], missing }]
}

const handlePropMissingValue = function (value) {
  const missing = !isRecurseObject(value)
  const valueA = missing ? {} : value
  return { value: valueA, missing }
}

// When the value does not exist, we set it deeply with `set()` but not with
// `list|get|has()`.
// We filter out between those two cases using a `missing` property.
// Tokens like wildcards cannot do this since there is known property to add.
// Array indices that are:
//  - Positive are kept
//  - Negative are converted to index 0
export const handleMissingValue = function (value, token) {
  return isIndexToken(token)
    ? handleIndexMissingValue(value)
    : handlePropMissingValue(value)
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
