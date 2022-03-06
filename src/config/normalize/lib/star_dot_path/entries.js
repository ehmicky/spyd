import { parse } from './parsing/parse.js'
import { serialize } from './parsing/serialize.js'
import { getObjectTokenType } from './tokens/main.js'

// List all values (and their associated path) matching a specific query for
// on specific target value.
export const listEntries = function (target, queryOrPath) {
  const path = parse(queryOrPath)
  return path.reduce(listTokenEntries, [
    { value: target, path: [], missing: false },
  ])
}

const listTokenEntries = function (entries, token) {
  return entries.flatMap((entry) => getTokenEntries(entry, token))
}

const getTokenEntries = function ({ value, path }, token) {
  const { tokenType, missing, value: valueA } = handleMissingValue(value, token)
  return tokenType.getEntries(valueA, path, token, missing)
}

// When the value does not exist, we set it deeply with `set()` but not with
// `list|get|has()`.
// We filter out between those two cases using a `missing` property.
// We distinguish between missing properties that are:
//  - known, i.e. returned: prop|index|slice tokens
//  - unknown, i.e. not returned: any|regexp tokens
// Tokens like wildcards cannot do this since there is known property to add.
export const handleMissingValue = function (value, token) {
  const tokenType = getObjectTokenType(token)
  const missing = tokenType.isMissing(value)
  const valueA = missing ? tokenType.defaultValue : value
  return { tokenType, missing, value: valueA }
}

// Compute all entries properties from the basic ones
export const normalizeEntry = function ({ value, path, missing }) {
  const query = serialize(path)
  return { value, path, query, missing }
}
