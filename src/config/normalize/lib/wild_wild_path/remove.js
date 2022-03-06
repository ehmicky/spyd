import omit from 'omit.js'

import { setArray } from '../../../../utils/set.js'

import { listEntries, handleMissingValue } from './entries.js'
import { setValue } from './set.js'

// Same as `set()` but removing a value
export const remove = function (target, queryOrPath) {
  const entries = listEntries(target, queryOrPath)
  return entries.some(hasRootPath)
    ? undefined
    : entries.reduce(
        (targetA, entry) => removeEntry(targetA, entry.path, 0),
        target,
      )
}

const hasRootPath = function ({ path }) {
  return path.length === 0
}

const removeEntry = function (target, path, index) {
  const key = path[index]

  if (handleMissingValue(target, key).missing) {
    return target
  }

  if (index === path.length - 1) {
    return removeValue(target, key)
  }

  const childTarget = target[key]
  const childValue = removeEntry(childTarget, path, index + 1)
  return setValue(target, key, childValue)
}

const removeValue = function (target, key) {
  return Array.isArray(target, key)
    ? removeArrayValue(target, key)
    : removeObjectValue(target, key)
}

// We make sure removing out-of-bound does not increase its length
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
  return key in target ? omit.default(target, [key]) : target
}