import { groupBy } from '../../../../utils/group.js'

import { equalsSimple, isSameToken } from './parsing/compare.js'
import { parse } from './parsing/parse.js'
import { serialize } from './parsing/serialize.js'
import { getObjectTokenType } from './tokens/main.js'

// List all values (and their associated path) matching a specific query for
// on specific target value.
export const iterate = function (
  target,
  queryOrPaths,
  { childFirst = false } = {},
) {
  const paths = parse(queryOrPaths)
  const entries = paths.map((path) => ({
    path,
    value: target,
    props: [],
    missing: false,
  }))
  const entriesA = iterateLevel(entries, childFirst, 0)
  const entriesB = entriesA.map(normalizeEntry)
  return entriesB
}

const iterateLevel = function (entries, childFirst, index) {
  const entriesA = removeDuplicates(entries)
  const parentEntries = entriesA.filter(({ path }) => path.length === index)

  if (parentEntries.length === entriesA.length) {
    return parentEntries
  }

  const levelEntries = entriesA
    .filter(({ path }) => path.length !== index)
    .flatMap((entry) => iteratePath(entry, index))

  if (levelEntries.length === 0) {
    return parentEntries
  }

  const childEntries = iterateChildren(levelEntries, childFirst, index)
  return childFirst
    ? [...childEntries, ...parentEntries]
    : [...parentEntries, ...childEntries]
}

const removeDuplicates = function (entries) {
  return entries.length === 1 ? entries : entries.filter(isNotDuplicate)
}

const isNotDuplicate = function (entryA, index, entries) {
  return entries.every(
    (entryB, indexB) => index <= indexB || !isDuplicate(entryA, entryB),
  )
}

const isDuplicate = function (
  { props: propsA, path: pathA },
  { props: propsB, path: pathB },
) {
  return (
    equalsSimple(propsA, propsB) &&
    pathA.length === pathB.length &&
    pathA.every(
      (tokenA, index) =>
        index < propsA.length || isSameToken(tokenA, pathB[index]),
    )
  )
}

// Iteration among siglings is not sorted, for performance reasons.
//  - Consumers can sort it through using the `query` property
// However, iteration is guaranteed to return child entries before parent ones.
//  - This is useful for recursive logic which must often be applied in a
//    specific parent-child order
const iteratePath = function ({ path, value, props }, index) {
  const token = path[index]
  const {
    tokenType,
    missing: missingParent,
    value: valueA,
  } = handleMissingValue(value, token)
  const levelEntries = tokenType.iterate(valueA, token)
  return levelEntries.map(
    ({ value: childValue, prop, missing: missingEntry }) => ({
      path,
      value: childValue,
      props: [...props, prop],
      missing: missingParent || missingEntry,
    }),
  )
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

const iterateChildren = function (levelEntries, childFirst, index) {
  const nextIndex = index + 1

  if (levelEntries.length === 1) {
    return iterateLevel(levelEntries, childFirst, nextIndex)
  }

  const levelEntriesGroups = Object.values(groupBy(levelEntries, getLastProp))
  return levelEntriesGroups.flatMap((levelEntriesA) =>
    iterateLevel(levelEntriesA, childFirst, nextIndex),
  )
}

const getLastProp = function ({ props }) {
  return props[props.length - 1]
}

const normalizeEntry = function ({ value, props: path, missing }) {
  const query = serialize(path)
  return { value, path, query, missing }
}
