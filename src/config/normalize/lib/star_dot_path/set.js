import omit from 'omit.js'

import { setArray } from '../../../../utils/set.js'

import { listEntries } from './entries/main.js'
import { isRecurseObject } from './entries/recurse.js'
import { parse } from './parsing/parse.js'
import { pathHasAny } from './parsing/path.js'
import { isIndexToken } from './parsing/validate.js'

// Set a value to one or multiple properties in `target` using a query string
export const set = function (target, queryOrPath, newValue) {
  const path = parse(queryOrPath)
  const entries = listEntries(target, path)
  const entriesA = addDefaultEntries(entries, path)
  return entriesA.reduce(
    (targetA, entry) => setEntry(targetA, entry.path, newValue),
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
  return setEntry(newTarget, path, value)
}

const setEntry = function (value, path, newValue) {
  return setEntryPart({ value, path, newValue, index: 0 })
}

const setEntryPart = function ({ value, path, newValue, index }) {
  if (index === path.length) {
    return newValue
  }

  const key = path[index]
  const defaultedValue = addDefaultTarget(value, key)
  const childValue = defaultedValue[key]
  const newChildValue = setEntryPart({
    value: childValue,
    path,
    newValue,
    index: index + 1,
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
