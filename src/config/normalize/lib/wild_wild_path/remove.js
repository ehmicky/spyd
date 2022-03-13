import omit from 'omit.js'

import { setArray } from '../../../../utils/set.js'

import { handleMissingValue } from './iterate/expand.js'
import { reduceParents, setValue } from './set.js'

// Same as `set()` but removing a value
export const remove = function (target, query, { classes = false } = {}) {
  const setFunc = removeAnyEntry.bind(undefined, classes)
  return reduceParents({ target, query, setFunc, classes })
}

// eslint-disable-next-line max-params
const removeAnyEntry = function (classes, target, path, index) {
  return path.length === 0
    ? undefined
    : removeEntry(classes, target, path, index)
}

// eslint-disable-next-line max-params
const removeEntry = function (classes, target, path, index) {
  const key = path[index]

  if (handleMissingValue(target, key, classes).missing) {
    return target
  }

  if (index === path.length - 1) {
    return removeValue(target, key)
  }

  const childTarget = target[key]
  const childValue = removeEntry(classes, childTarget, path, index + 1)
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
