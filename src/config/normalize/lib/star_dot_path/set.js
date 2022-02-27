import omitLib from 'omit.js'

import { setArray } from '../../../../utils/set.js'

import { listFullEntries } from './entries/main.js'
import { maybeParse } from './parsing/parse.js'

// Set a value to one or multiple properties in `target` using a query string
export const set = function (target, queryOrPath, setValue) {
  return transform(target, queryOrPath, () => setValue)
}

// Same but using a function returning the value to set
export const transform = function (target, queryOrPath, transformFunc) {
  const nodes = maybeParse(queryOrPath)
  const entries = listFullEntries(target, nodes)
  return entries.reduce(
    (targetA, entry) => setProp(targetA, 0, { entry, transformFunc }),
    target,
  )
}

const setProp = function (
  target,
  index,
  { entry, entry: { path }, transformFunc },
) {
  if (index === path.length) {
    return transformFunc({ value: entry.value, path, query: entry.query })
  }

  const key = path[index]
  const childValue = target[key]
  const newIndex = index + 1
  const newChildValue = setProp(childValue, newIndex, { entry, transformFunc })
  return setNewChildValue(target, key, newChildValue)
}

// Delete one or multiple properties in `target` using a query string
export const remove = function (target, queryOrPath) {
  return omit(target, queryOrPath, () => true)
}

export const omit = function (target, queryOrPath, condition) {
  const nodes = maybeParse(queryOrPath)
  const entries = listFullEntries(target, nodes)
  return entries.reduce(
    (targetA, entry) => removeProp(targetA, 0, { entry, condition }),
    target,
  )
}

const removeProp = function (
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

  const newChildValue = removeProp(childValue, newIndex, { entry, condition })
  return setNewChildValue(value, key, newChildValue)
}

const removeValue = function (value, key) {
  if (!Number.isInteger(key)) {
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

  return Number.isInteger(key)
    ? setArray(value, key, newChildValue)
    : { ...value, [key]: newChildValue }
}
