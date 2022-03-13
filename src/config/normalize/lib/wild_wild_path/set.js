import { setArray } from '../../../../utils/set.js'

import { handleMissingValue } from './iterate/expand.js'
import { iterate } from './iterate/main.js'
import { isParentPath } from './parsing/compare.js'

// Set a value to one or multiple properties in `target` using a query string.
export const set = function (target, query, value) {
  return reduceParents(target, query, setEntry.bind(undefined, value))
}

// Modify a target object multiple times for each matched property.
// Ignore properties when one of their ancestors was matched too.
// Uses `iterate()` to keep memory consumption low.
export const reduceParents = function (target, query, setFunc) {
  const paths = []

  // eslint-disable-next-line fp/no-loops
  for (const { path } of iterate(target, query, { childFirst: false })) {
    // eslint-disable-next-line max-depth
    if (!parentIsSet(paths, path)) {
      // eslint-disable-next-line fp/no-mutating-methods
      paths.push(path)
      // eslint-disable-next-line fp/no-mutation, no-param-reassign
      target = setFunc(target, path, 0)
    }
  }

  return target
}

// If both a parent and a child property are set, the parent prevails
const parentIsSet = function (paths, path) {
  return paths.some((previousPath) => isParentPath(previousPath, path))
}

// Use positional arguments for performance
// eslint-disable-next-line max-params
const setEntry = function (value, target, path, index) {
  if (index === path.length) {
    return value
  }

  const prop = path[index]
  const { value: defaultedTarget } = handleMissingValue(target, prop)
  const childTarget = defaultedTarget[prop]
  const childValue = setEntry(value, childTarget, path, index + 1)
  return setValue(defaultedTarget, prop, childValue)
}

export const setValue = function (target, prop, childValue) {
  if (isNoopSet(target, prop, childValue)) {
    return target
  }

  return Array.isArray(target)
    ? setArray(target, prop, childValue)
    : { ...target, [prop]: childValue }
}

// Do not set value if it has not changed.
// We distinguish between `undefined` values with the property set and unset.
const isNoopSet = function (target, prop, childValue) {
  return (
    target[prop] === childValue && (childValue !== undefined || prop in target)
  )
}
