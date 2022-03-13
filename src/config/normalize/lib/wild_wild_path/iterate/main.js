import { groupBy } from '../../../../../utils/group.js'
import { parse } from '../parsing/parse.js'
import { serialize } from '../parsing/serialize.js'

import { removeDuplicates } from './duplicate.js'
import { expandPath } from './expand.js'

// Iterate over all values (and their associated path) matching a specific
// query for on specific target value.
// Uses an iterator:
//  - To allow consumers to return only the first matching entry quickly
//  - To keep memory consumption low even on big queries
export const iterate = function* (
  target,
  queryOrPaths,
  { childFirst = false } = {},
) {
  const paths = parse(queryOrPaths)
  const entries = paths.map((path) => ({
    path,
    value: target,
    simplePath: [],
    missing: false,
  }))
  yield* iterateLevel(entries, childFirst, 0)
}

const iterateLevel = function* (entries, childFirst, index) {
  const entriesA = removeDuplicates(entries)
  const parentEntries = getParentEntries(entriesA, index)

  if (!childFirst) {
    yield* parentEntries
  }

  yield* iterateChildEntries(entries, parentEntries, childFirst, index)

  if (childFirst) {
    yield* parentEntries
  }
}

const getParentEntries = function (entries, index) {
  return entries.filter(({ path }) => path.length === index).map(normalizeEntry)
}

const normalizeEntry = function ({ value, simplePath: path, missing }) {
  const query = serialize(path)
  return { value, path, query, missing }
}

// eslint-disable-next-line max-params
const iterateChildEntries = function* (
  entries,
  parentEntries,
  childFirst,
  index,
) {
  if (parentEntries.length === entries.length) {
    return
  }

  const childEntries = entries
    .filter(({ path }) => path.length !== index)
    .flatMap((entry) => expandPath(entry, index))

  if (childEntries.length === 0) {
    return
  }

  yield* iterateChildren(childEntries, childFirst, index)
}

const iterateChildren = function* (childEntries, childFirst, index) {
  const nextIndex = index + 1

  if (childEntries.length === 1) {
    yield* iterateLevel(childEntries, childFirst, nextIndex)
    return
  }

  const childEntriesGroups = Object.values(groupBy(childEntries, getLastProp))

  // eslint-disable-next-line fp/no-loops
  for (const childEntriesA of childEntriesGroups) {
    yield* iterateLevel(childEntriesA, childFirst, nextIndex)
  }
}

const getLastProp = function ({ simplePath }) {
  return simplePath[simplePath.length - 1]
}
