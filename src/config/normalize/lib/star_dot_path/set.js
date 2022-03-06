import omit from 'omit.js'

import { setArray } from '../../../../utils/set.js'

import { listEntries, handleMissingValue } from './entries.js'
import { parse } from './parsing/parse.js'

// Set a value to one or multiple properties in `target` using a query string
export const set = function (target, queryOrPath, value) {
  const path = parse(queryOrPath)
  const entries = listEntries(target, path)
  return entries.reduce(
    (targetA, entry) =>
      setEntry({ target: targetA, path: entry.path, value, index: 0 }),
    target,
  )
}

const setEntry = function ({ target, path, value, index }) {
  if (index === path.length) {
    return value
  }

  const key = path[index]
  const defaultedTarget = handleMissingValue(target, key)
  const childTarget = defaultedTarget[key]
  const childValue = setEntry({
    target: childTarget,
    path,
    value,
    index: index + 1,
  })
  return setValue(defaultedTarget, key, childValue)
}

const setValue = function (target, key, childValue) {
  if (target[key] === childValue) {
    return target
  }

  return Array.isArray(target)
    ? setArray(target, key, childValue)
    : { ...target, [key]: childValue }
}

const removeValue = function (target, key) {
  return Array.isArray(target, key)
    ? removeArrayValue(target, key)
    : removeObjectValue(target, key)
}

const removeArrayValue = function (target, key) {
  if (target[key] === undefined) {
    return target
  }

  const newArray = setArray(target, key)
  return newArray.every(isUndefined) ? [] : newArray
}

const isUndefined = function (item) {
  return item === undefined
}

const removeObjectValue = function (target, key) {
  if (!(key in target)) {
    return target
  }

  return omit.default(target, [key])
}
