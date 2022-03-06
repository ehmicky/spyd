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
  const { value: defaultedTarget } = handleMissingValue(target, key)
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
