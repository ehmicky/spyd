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
  const parents = new Set([])
  const opts = { childFirst, sort, classes }
  const queryArrays = parseQuery(query)
  const entries = queryArrays.map((queryArray) => ({
    queryArray,
    value: target,
    path: [],
    missing: false,
  }))
  yield* iterateLevel({ entries, index: 0, parents, opts })
}

// `parents` is used to prevent infinite recursions when using ** together with
// a value that includes references to itself
const iterateLevel = function* ({
  entries,
  entries: [{ value }],
  index,
  parents,
  opts,
}) {
  if (parents.has(value)) {
    return
  }

  parents.add(value)
  yield* iterateToken({ entries, index, parents, opts })
  parents.delete(value)
}

// eslint-disable-next-line complexity
const iterateToken = function* ({ entries, index, parents, opts }) {
  const entriesA = expandRecursiveTokens(entries, index)
  const entriesB = removeDuplicates(entriesA)
  const parentEntry = getParentEntry(entriesB, index)

  if (parentEntry !== undefined && !opts.childFirst) {
    yield normalizeEntry(parentEntry)
  }

  if (parentEntry === undefined || entriesB.length !== 1) {
    yield* iterateChildEntries({ entries: entriesB, index, parents, opts })
  }

  if (parentEntry !== undefined && opts.childFirst) {
    yield normalizeEntry(parentEntry)
  }
}

const getParentEntry = function (entries, index) {
  return entries.find(({ queryArray }) => queryArray.length === index)
}

const normalizeEntry = function ({ value, path, missing }) {
  const query = serializePath(path)
  return { value, path, query, missing }
}

const iterateChildEntries = function* ({ entries, index, parents, opts }) {
  const childEntries = expandTokens(entries, index, opts.classes)

  if (childEntries.length === 0) {
    return
  }

  yield* iterateChildren({ childEntries, index, parents, opts })
}

const iterateChildren = function* ({ childEntries, index, parents, opts }) {
  const nextIndex = index + 1

  if (childEntries.length === 1) {
    yield* iterateLevel({
      entries: childEntries,
      index: nextIndex,
      parents,
      opts,
    })
    return
  }

  const childEntriesGroups = groupSortChildEntries(childEntries, opts.sort)

  // eslint-disable-next-line fp/no-loops
  for (const entries of childEntriesGroups) {
    yield* iterateLevel({ entries, index: nextIndex, parents, opts })
  }
}
