import { serialize } from './parsing/serialize.js'
import { getObjectTokenType } from './tokens/main.js'

// List all values (and their associated path) matching a specific query for
// on specific target value.
export const listEntries = function (target, path) {
  return path.reduce(listTokenEntries, [
    { value: target, path: [], defined: true },
  ])
}

const listTokenEntries = function (entries, token) {
  return entries.flatMap((entry) => getTokenEntries(entry, token))
}

const getTokenEntries = function ({ value, path }, token) {
  const tokenType = getObjectTokenType(token)
  const defined = tokenType.isDefined(value)
  const valueA = defined ? value : tokenType.defaultValue
  const entries = tokenType.getEntries(valueA, path, token, defined)
  return entries
}

// When the value does not exist, we set it deeply with `set()` but not with
// `list|get|has()`.
// We filter out between those two cases using a `defined` property.
// Tokens like wildcards cannot do this since there is known property to add.
// Array indices that are:
//  - Positive are kept
//  - Negative are converted to index 0
export const handleMissingValue = function (value, token) {
  const tokenType = getObjectTokenType(token)
  const defined = tokenType.isDefined(value)
  const valueA = defined ? value : tokenType.defaultValue
  return valueA
}

export const isDefined = function (value, token) {
  const tokenType = getObjectTokenType(token)
  return tokenType.isDefined(value)
}

// Compute all entries properties from the basic ones
export const normalizeEntry = function ({ value, path }) {
  const query = serialize(path)
  return { value, path, query }
}
