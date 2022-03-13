import { groupBy } from '../../../../utils/group.js'

import { parse } from './parsing/parse.js'
import { serialize } from './parsing/serialize.js'
import { getObjectTokenType } from './tokens/main.js'

// List all values (and their associated path) matching a specific query for
// on specific target value.
export const iterate = function (target, queryOrPaths) {
  const paths = parse(queryOrPaths)
  const entries = paths.map((path) => ({
    path,
    value: target,
    props: [],
    missing: false,
  }))
  const entriesA = iterateLevel(entries, 0)
  return entriesA
}

const iterateLevel = function (entries, index) {
  const parentEntries = entries.filter(({ path }) => path.length === index)
  const levelEntries = entries
    .filter(({ path }) => path.length !== index)
    .flatMap((entry) => iteratePath(entry, index))
  const entriesGroups = Object.values(groupBy(levelEntries, 'prop'))
  const nextIndex = index + 1
  const childEntries = entriesGroups.flatMap((levelEntriesA) =>
    iterateLevel(levelEntriesA, nextIndex),
  )
  return [...parentEntries, ...childEntries]
}

const iteratePath = function ({ path, value, props }, index) {
  const token = path[index]
  const { tokenType, missing, value: valueA } = handleMissingValue(value, token)
  const levelEntries = tokenType.iterate(valueA, token, missing)
  return levelEntries.map(({ value: childValue, prop, missing: missingA }) => ({
    path,
    value: childValue,
    props: [...props, prop],
    missing: missingA,
  }))
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
