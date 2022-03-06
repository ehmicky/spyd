import omit from 'omit.js'

import { setArray } from '../../../../utils/set.js'

import { listEntries } from './entries/main.js'
import { isRecurseObject } from './entries/recurse.js'
import { parse } from './parsing/parse.js'
import { pathHasAny } from './parsing/path.js'
import { isIndexToken } from './parsing/validate.js'

// Set a value to one or multiple properties in `target` using a query string
export const set = function (target, queryOrPath, value) {
  const path = parse(queryOrPath)
  const entries = listEntries(target, path)
  const entriesA = addDefaultEntries(entries, path)
  return entriesA.reduce(
    (targetA, entry) =>
      setEntryPart({ target: targetA, path: entry.path, value, index: 0 }),
    target,
  )
}

// When the value does not exist, we set it deeply.
// However, we cannot do this when the query has at least one wildcard which
// does not match anything.
const addDefaultEntries = function (entries, path) {
  return entries.length === 0 && !pathHasAny(path) ? [{ path }] : entries
}

const setEntryPart = function ({ target, path, value, index }) {
  if (index === path.length) {
    return value
  }

  const key = path[index]
  const defaultedTarget = addDefaultTarget(target, key)
  const childTarget = defaultedTarget[key]
  const childValue = setEntryPart({
    target: childTarget,
    path,
    value,
    index: index + 1,
  })
  return setValue(defaultedTarget, key, childValue)
}

const addDefaultTarget = function (target, key) {
  if (Array.isArray(target) || isRecurseObject(target)) {
    return target
  }

  return isIndexToken(key) ? [] : {}
}

const setValue = function (target, key, childValue) {
  if (target[key] === childValue) {
    return target
  }

  return childValue === undefined
    ? removeValue(target, key)
    : setDefinedValue(target, key, childValue)
}

// We purposely do not distinguish between a missing property and a property set
// to `undefined` since:
//  - This is a bad pattern for consumer logic to make that distinction
//  - This removes the need for a separate `remove()` method
//  - Deleting `undefined` properties by default leads to cleaner return values
// If the value was already `undefined`, we keep it as is though.
const removeValue = function (target, key) {
  if (!Array.isArray(target, key)) {
    return omit.default(target, [key])
  }

  const newArray = setArray(target, key)
  return newArray.every(isUndefined) ? [] : newArray
}

const isUndefined = function (item) {
  return item === undefined
}

const setDefinedValue = function (target, key, childValue) {
  return Array.isArray(target)
    ? setArray(target, key, childValue)
    : { ...target, [key]: childValue }
}
