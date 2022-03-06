import omit from 'omit.js'

import { setArray } from '../../../../utils/set.js'

import { listEntries, normalizeEntry } from './entries/main.js'
import { isRecurseObject } from './entries/recurse.js'
import { parse } from './parsing/parse.js'
import { pathHasAny } from './parsing/path.js'
import { isIndexToken } from './parsing/validate.js'

// Set a value to one or multiple properties in `target` using a query string
export const set = function (target, queryOrPath, newValue) {
  return transform(target, queryOrPath, () => newValue)
}

// Same but using a function returning the value to set
const transform = function (target, queryOrPath, transformFunc) {
  const path = parse(queryOrPath)
  const entries = listEntries(target, path)
  const entriesA = addDefaultEntries(entries, path)
  return entriesA.reduce(
    (targetA, entry) => setEntry(targetA, entry, transformFunc),
    target,
  )
}

// When the value does not exist, we set it deeply.
// However, we cannot do this when the query has at least one wildcard which
// does not match anything.
const addDefaultEntries = function (entries, path) {
  return entries.length === 0 && !pathHasAny(path) ? [{ path }] : entries
}

// Returns an object with only the properties being queried.
export const pick = function (target, queryOrPath) {
  const path = parse(queryOrPath)
  const entries = listEntries(target, path)
  return entries.reduce(pickEntry, {})
}

const pickEntry = function (newTarget, { value, path }) {
  return setEntry(newTarget, { path }, () => value)
}

const setEntry = function (value, entry, transformFunc) {
  const entryA = normalizeEntry(entry)
  return setEntryPart(value, 0, { entry: entryA, transformFunc })
}

const setEntryPart = function (
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
  const newChildValue = setEntryPart(childValue, index + 1, {
    entry,
    transformFunc,
  })
  return setValue(defaultedValue, key, newChildValue)
}

const addDefaultTarget = function (value, key) {
  if (Array.isArray(value) || isRecurseObject(value)) {
    return value
  }

  return isIndexToken(key) ? [] : {}
}

const setValue = function (value, key, newChildValue) {
  if (value[key] === newChildValue) {
    return value
  }

  return newChildValue === undefined
    ? removeValue(value, key)
    : setDefinedValue(value, key, newChildValue)
}

// We purposely do not distinguish between a missing property and a property set
// to `undefined` since:
//  - This is a bad pattern for consumer logic to make that distinction
//  - This removes the need for a separate `remove()` method
//  - Deleting `undefined` properties by default leads to cleaner return values
// If the value was already `undefined`, we keep it as is though.
const removeValue = function (value, key) {
  if (!Array.isArray(value, key)) {
    return omit.default(value, [key])
  }

  const newArray = setArray(value, key)
  return newArray.every(isUndefined) ? [] : newArray
}

const isUndefined = function (item) {
  return item === undefined
}

const setDefinedValue = function (value, key, newChildValue) {
  return Array.isArray(value)
    ? setArray(value, key, newChildValue)
    : { ...value, [key]: newChildValue }
}
