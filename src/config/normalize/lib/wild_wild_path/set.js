import { setArray } from '../../../../utils/set.js'

import { handleMissingValue } from './iterate/expand.js'
import { iterate } from './iterate/main.js'

// Set a value to one or multiple properties in `target` using a query string.
// Uses `iterate()` to keep memory consumption low.
export const set = function (target, queryOrPath, value) {
  // eslint-disable-next-line fp/no-let
  let newTarget = target

  // eslint-disable-next-line fp/no-loops
  for (const { path } of iterate(target, queryOrPath)) {
    // eslint-disable-next-line fp/no-mutation
    newTarget = setEntry(newTarget, path, value, 0)
  }

  return newTarget
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
  if (isNoopSet(target, key, childValue)) {
    return target
  }

  return Array.isArray(target)
    ? setArray(target, key, childValue)
    : { ...target, [key]: childValue }
}

// Do not set value if it has not changed.
// We distinguish between `undefined` values with the property set and unset.
const isNoopSet = function (target, key, childValue) {
  return (
    target[key] === childValue && (childValue !== undefined || key in target)
  )
}
