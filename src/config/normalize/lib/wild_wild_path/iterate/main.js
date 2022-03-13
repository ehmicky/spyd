import { parseQuery, serializePath } from '../../wild_wild_parser/main.js'
import { validateInherited } from '../validate.js'

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
  {
    childFirst = false,
    roots = false,
    sort = false,
    missing = false,
    classes = false,
    inherited = false,
  } = {},
) {
  const opts = { childFirst, roots, sort, missing, classes, inherited }
  validateInherited(opts)
  const parents = new Set([])
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

// The `roots` option can be used to only include the highest ancestors
// eslint-disable-next-line complexity
const iterateToken = function* ({ entries, index, parents, opts }) {
  const entriesA = expandRecursiveTokens(entries, index)
  const entriesB = removeDuplicates(entriesA)
  const parentEntry = getParentEntry(entriesB, index)

  if (parentEntry !== undefined && !opts.childFirst) {
    yield normalizeEntry(parentEntry)
  }

  if (parentEntry === undefined || (entriesB.length !== 1 && !opts.roots)) {
    yield* iterateChildren({ entries: entriesB, index, parents, opts })
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
