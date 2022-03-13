import { groupBy } from '../../../../../utils/group.js'
import { parseQuery } from '../parsing/parse.js'
import { serializePath } from '../parsing/serialize.js'

import { removeDuplicates } from './duplicate.js'
import { expandToken } from './expand.js'

// Iterate over all values (and their associated path) matching a specific
// query for on specific target value.
// Uses an iterator:
//  - To allow consumers to return only the first matching entry quickly
//  - To keep memory consumption low even on big queries
export const iterate = function* (
  target,
  query,
  { childFirst = false, sort = false } = {},
) {
  const queryArrays = parseQuery(query)
  const entries = queryArrays.map((queryArray) => ({
    queryArray,
    value: target,
    path: [],
    missing: false,
  }))
  yield* iterateLevel({ entries, childFirst, sort, index: 0 })
}

const iterateLevel = function* ({ entries, childFirst, sort, index }) {
  const entriesA = removeDuplicates(entries)
  const parentEntries = getParentEntries(entriesA, index)

  if (!childFirst) {
    yield* parentEntries
  }

  yield* iterateChildEntries({
    entries,
    parentEntries,
    childFirst,
    sort,
    index,
  })

  if (childFirst) {
    yield* parentEntries
  }
}

const getParentEntries = function (entries, index) {
  return entries
    .filter(({ queryArray }) => queryArray.length === index)
    .map(normalizeEntry)
}

const normalizeEntry = function ({ value, path, missing }) {
  const query = serializePath(path)
  return { value, path, query, missing }
}

const iterateChildEntries = function* ({
  entries,
  parentEntries,
  childFirst,
  sort,
  index,
}) {
  if (parentEntries.length === entries.length) {
    return
  }

  const childEntries = entries
    .filter(({ queryArray }) => queryArray.length !== index)
    .flatMap((entry) => expandToken(entry, index))

  if (childEntries.length === 0) {
    return
  }

  yield* iterateChildren({ childEntries, childFirst, sort, index })
}

const iterateChildren = function* ({ childEntries, childFirst, sort, index }) {
  const nextIndex = index + 1

  if (childEntries.length === 1) {
    yield* iterateLevel({
      entries: childEntries,
      childFirst,
      sort,
      index: nextIndex,
    })
    return
  }

  const childEntriesGroups = Object.values(groupBy(childEntries, getLastProp))

  // eslint-disable-next-line fp/no-loops
  for (const entries of childEntriesGroups) {
    yield* iterateLevel({ entries, childFirst, sort, index: nextIndex })
  }
}

const getLastProp = function ({ path }) {
  return path[path.length - 1]
}
