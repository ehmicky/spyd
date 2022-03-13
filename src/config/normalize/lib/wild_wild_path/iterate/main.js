import { parseQuery, serializePath } from '../../wild_wild_parser/main.js'

import { removeDuplicates } from './duplicate.js'
import { expandTokens } from './expand.js'
import { groupSortChildEntries } from './group.js'
import { getOptions } from './options.js'
import { expandRecursiveTokens } from './recurse.js'

// Iterate over all values (and their associated path) matching a specific
// query for on specific target value.
// Uses an iterator:
//  - To allow consumers to return only the first matching entry quickly
//  - To keep memory consumption low even on big queries
export const iterate = function* (target, query, opts) {
  const optsA = getOptions(opts)
  const parents = new Set([])
  const entries = getRootEntries(target, query)
  yield* iterateLevel({ entries, index: 0, parents, opts: optsA })
}

const getRootEntries = function (target, query) {
  const queryArrays = parseQuery(query)
  return queryArrays.map((queryArray) => ({
    queryArray,
    value: target,
    path: [],
    missing: false,
  }))
}

// `parents` is used to prevent infinite recursions when using ** together with
// a value that includes references to itself
const iterateLevel = function* ({
  entries,
  entries: [{ value, missing }],
  index,
  parents,
  opts,
}) {
  if (missing) {
    yield* iterateToken({ entries, index, parents, opts })
    return
  }

  if (parents.has(value)) {
    return
  }

  parents.add(value)
  yield* iterateToken({ entries, index, parents, opts })
  parents.delete(value)
}

// The `roots` option can be used to only include the highest ancestors.
// The `leaves` option can be used to only include the lowest descendants.
// Neither option includes the values in-between.
const iterateToken = function* ({ entries, index, parents, opts }) {
  const entriesA = expandRecursiveTokens(entries, index)
  const entriesB = removeDuplicates(entriesA)
  const parentEntry = getParentEntry(entriesB, index)

  if (shouldYieldParentFirst(parentEntry, opts)) {
    yield normalizeEntry(parentEntry)
  }

  const hasChildren = yield* iterateChildEntries({
    entries: entriesB,
    parentEntry,
    index,
    parents,
    opts,
  })

  if (shouldYieldParentLast(parentEntry, hasChildren, opts)) {
    yield normalizeEntry(parentEntry)
  }
}

const getParentEntry = function (entries, index) {
  return entries.find(({ queryArray }) => queryArray.length === index)
}

const shouldYieldParentFirst = function (parentEntry, { childFirst }) {
  return parentEntry !== undefined && !childFirst
}

const shouldYieldParentLast = function (
  parentEntry,
  hasChildren,
  { childFirst, leaves },
) {
  return parentEntry !== undefined && childFirst && !(leaves && hasChildren)
}

const normalizeEntry = function ({ value, path, missing }) {
  const query = serializePath(path)
  return { value, path, query, missing }
}

const iterateChildEntries = function* ({
  entries,
  parentEntry,
  index,
  parents,
  opts,
}) {
  if (!shouldIterateChildren(entries, parentEntry, opts)) {
    return false
  }

  // eslint-disable-next-line fp/no-let
  let hasChildren = false

  // eslint-disable-next-line fp/no-loops
  for (const childEntry of iterateChildren({ entries, index, parents, opts })) {
    // eslint-disable-next-line fp/no-mutation
    hasChildren = true
    yield childEntry
  }

  return hasChildren
}

const shouldIterateChildren = function (entries, parentEntry, { roots }) {
  return parentEntry === undefined || (entries.length !== 1 && !roots)
}

const iterateChildren = function* ({ entries, index, parents, opts }) {
  const childEntries = expandTokens(entries, index, opts)

  if (childEntries.length === 0) {
    return
  }

  const indexA = index + 1

  if (childEntries.length === 1) {
    yield* iterateLevel({ entries: childEntries, index: indexA, parents, opts })
    return
  }

  const childEntriesGroups = groupSortChildEntries(childEntries, opts.sort)

  // eslint-disable-next-line fp/no-loops
  for (const childEntriesA of childEntriesGroups) {
    yield* iterateLevel({
      entries: childEntriesA,
      index: indexA,
      parents,
      opts,
    })
  }
}
