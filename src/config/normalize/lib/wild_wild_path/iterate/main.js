import { parseQuery, serializePath } from '../../wild_wild_path_parser/main.js'

import { removeDuplicates } from './duplicate.js'
import { expandTokens } from './expand.js'
import { groupSortChildEntries } from './group.js'
import { expandRecursiveTokens } from './recurse.js'

// Iterate over all values (and their associated path) matching a specific
// query for on specific target value.
// Uses an iterator:
//  - To allow consumers to return only the first matching entry quickly
//  - To keep memory consumption low even on big queries
export const iterate = function* (
  target,
  query,
  { childFirst = false, sort = false, classes = false } = {},
) {
  const opts = { childFirst, sort, classes }
  const queryArrays = parseQuery(query)
  const entries = queryArrays.map((queryArray) => ({
    queryArray,
    value: target,
    path: [],
    missing: false,
  }))
  yield* iterateLevel(entries, 0, opts)
}

const iterateLevel = function* (entries, index, opts) {
  const entriesA = expandRecursiveTokens(entries, index)
  const entriesB = removeDuplicates(entriesA)
  const parentEntry = getParentEntry(entriesB, index)

  if (parentEntry !== undefined && !opts.childFirst) {
    yield parentEntry
  }

  yield* iterateChildEntries({ entries: entriesB, parentEntry, index, opts })

  if (parentEntry !== undefined && opts.childFirst) {
    yield parentEntry
  }
}

const getParentEntry = function (entries, index) {
  const parentEntry = entries.find(
    ({ queryArray }) => queryArray.length === index,
  )
  return parentEntry === undefined ? undefined : normalizeEntry(parentEntry)
}

const normalizeEntry = function ({ value, path, missing }) {
  const query = serializePath(path)
  return { value, path, query, missing }
}

const iterateChildEntries = function* ({ entries, parentEntry, index, opts }) {
  if (parentEntry !== undefined && entries.length === 1) {
    return
  }

  const childEntries = expandTokens(entries, index, opts.classes)

  if (childEntries.length === 0) {
    return
  }

  yield* iterateChildren(childEntries, index, opts)
}

const iterateChildren = function* (childEntries, index, opts) {
  const nextIndex = index + 1

  if (childEntries.length === 1) {
    yield* iterateLevel(childEntries, nextIndex, opts)
    return
  }

  const childEntriesGroups = groupSortChildEntries(childEntries, opts.sort)

  // eslint-disable-next-line fp/no-loops
  for (const entries of childEntriesGroups) {
    yield* iterateLevel(entries, nextIndex, opts)
  }
}
