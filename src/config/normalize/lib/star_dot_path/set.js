import { setArray } from '../../../../utils/set.js'

import { listEntries, normalizeEntry } from './entries/main.js'
import { isRecurseObject } from './entries/recurse.js'
import { maybeParse } from './parsing/parse.js'
import { pathHasAny, isIndexNode } from './parsing/path.js'

// Set a value to one or multiple properties in `target` using a query string
export const set = function (target, queryOrPath, setValue) {
  return transform(target, queryOrPath, () => setValue)
}

// Same but using a function returning the value to set
export const transform = function (target, queryOrPath, transformFunc) {
  const path = maybeParse(queryOrPath)
  const entries = listEntries(target, path)
  const entriesA = addDefaultEntries(entries, path)
  return setEntries(target, entriesA, transformFunc)
}

// When the value does not exist, we set it deeply.
// However, we cannot do this when the query has at least one wildcard which
// does not match anything.
const addDefaultEntries = function (entries, path) {
  return entries.length === 0 && !pathHasAny(path) ? [{ path }] : entries
}

const setEntries = function (target, entries, transformFunc) {
  return entries
    .map(normalizeEntry)
    .reduce(
      (targetA, entry) => setEntry(targetA, 0, { entry, transformFunc }),
      target,
    )
}

const setEntry = function (
  value,
  index,
  { entry, entry: { path, query }, transformFunc },
) {
  if (index === path.length) {
    return transformFunc({ value, path, query })
  }

  const key = path[index]
  const defaultedValue = addDefaultTarget(value, key)
  const childValue = defaultedValue[key]
  const newIndex = index + 1
  const newChildValue = setEntry(childValue, newIndex, { entry, transformFunc })
  return setNewChildValue(defaultedValue, key, newChildValue)
}

const addDefaultTarget = function (value, key) {
  if (Array.isArray(value) || isRecurseObject(value)) {
    return value
  }

  return isIndexNode(key) ? [] : {}
}

export const setNewChildValue = function (value, key, newChildValue) {
  if (value[key] === newChildValue) {
    return value
  }

  return Array.isArray(value)
    ? setArray(value, key, newChildValue)
    : { ...value, [key]: newChildValue }
}
