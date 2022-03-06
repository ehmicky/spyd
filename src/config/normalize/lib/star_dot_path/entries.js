import { serialize } from './parsing/serialize.js'
import { isAnyToken, getAnyEntries } from './tokens/any.js'
import {
  isIndexToken,
  getIndexEntries,
  handleIndexMissingValue,
} from './tokens/array.js'
import { getPropEntries, handlePropMissingValue } from './tokens/prop.js'
import { isRegExpToken, getRegExpEntries } from './tokens/regexp.js'

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

// Compute all entries properties from the basic ones
export const normalizeEntry = function ({ value, path }) {
  const query = serialize(path)
  return { value, path, query }
}
