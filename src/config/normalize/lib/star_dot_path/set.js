import { setArray } from '../../../../utils/set.js'

import { listEntries, handleMissingValue } from './entries.js'

// Set a value to one or multiple properties in `target` using a query string
export const set = function (target, queryOrPath, value) {
  const entries = listEntries(target, queryOrPath)
  return entries.reduce(
    (targetA, entry) => setEntry(targetA, entry.path, value, 0),
    target,
  )
}

// Use positional arguments for performance
// eslint-disable-next-line max-params
const setEntry = function (target, path, value, index) {
  if (index === path.length) {
    return value
  }

  const key = path[index]
  const { value: defaultedTarget } = handleMissingValue(target, key)
  const childTarget = defaultedTarget[key]
  const childValue = setEntry(childTarget, path, value, index + 1)
  return setValue(defaultedTarget, key, childValue)
}

export const setValue = function (target, key, childValue) {
  if (target[key] === childValue) {
    return target
  }

  return Array.isArray(target)
    ? setArray(target, key, childValue)
    : { ...target, [key]: childValue }
}
