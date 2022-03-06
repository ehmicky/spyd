import omitLib from 'omit.js'

import { setArray } from '../../../../utils/set.js'

import { listEntries, normalizeEntry } from './entries/main.js'
import { isObject } from './entries/recurse.js'
import { maybeParse } from './parsing/parse.js'
import { pathHasAny, isIndexNode } from './parsing/path.js'

// Set a value to one or multiple properties in `target` using a query string
export const set = function (target, queryOrPath, setValue) {
  return transform(target, queryOrPath, () => setValue)
}

// Same but using a function returning the value to set
export const transform = function (target, queryOrPath, transformFunc) {
  const path = maybeParse(queryOrPath)
  const entries = listTransformEntries(target, path)
  return entries
    .map(normalizeEntry)
    .reduce(
      (targetA, entry) => setEntry(targetA, 0, { entry, transformFunc }),
      target,
    )
}

// When the value does not exist, we set it deeply.
// However, we cannot do this when the query has at least one wildcard which
// does not match anything.
const listTransformEntries = function (target, path) {
  const entries = listEntries(target, path)
  return entries.length === 0 && !pathHasAny(path) ? [{ path }] : entries
}

const setEntry = function (
  target,
  index,
  { entry, entry: { path }, transformFunc },
) {
  if (index === path.length) {
    return transformFunc({ value: entry.value, path, query: entry.query })
  }

  const key = path[index]
  const targetA = addDefaultTarget(target, key)
  const childValue = targetA[key]
  const newIndex = index + 1
  const newChildValue = setEntry(childValue, newIndex, { entry, transformFunc })
  return setNewChildValue(targetA, key, newChildValue)
}

const addDefaultTarget = function (target, key) {
  if (Array.isArray(target) || isObject(target)) {
    return target
  }

  return isIndexNode(key) ? [] : {}
}

// Delete one or multiple properties in `target` using a query string
export const omit = function (target, queryOrPath) {
  return exclude(target, queryOrPath, () => true)
}

export const exclude = function (target, queryOrPath, condition) {
  const nodes = maybeParse(queryOrPath)
  const entries = listEntries(target, nodes)
  return entries
    .map(normalizeEntry)
    .reduce(
      (targetA, entry) => excludeEntry(targetA, 0, { entry, condition }),
      target,
    )
}

const excludeEntry = function (
  value,
  index,
  { entry, entry: { path }, condition },
) {
  const key = path[index]
  const childValue = value[key]

  if (childValue === undefined) {
    return value
  }

  const newIndex = index + 1

  if (newIndex === path.length) {
    return condition(entry) ? removeValue(value, key) : value
  }

  const newChildValue = excludeEntry(childValue, newIndex, { entry, condition })
  return setNewChildValue(value, key, newChildValue)
}

const removeValue = function (value, key) {
  if (!isIndexNode(key)) {
    return omitLib.default(value, [key])
  }

  const newArray = setArray(value, key)
  return newArray.every(isUndefined) ? [] : newArray
}

const isUndefined = function (item) {
  return item === undefined
}

const setNewChildValue = function (value, key, newChildValue) {
  if (value[key] === newChildValue) {
    return value
  }

  return isIndexNode(key)
    ? setArray(value, key, newChildValue)
    : { ...value, [key]: newChildValue }
}
