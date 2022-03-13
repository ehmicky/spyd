import { setArray } from '../../../../utils/set.js'

import { list } from './get.js'
import { handleMissingValue } from './iterate/expand.js'
import { isParentPath } from './parsing/compare.js'

// Set a value to one or multiple properties in `target` using a query string.
// eslint-disable-next-line max-params
export const set = function (
  target,
  query,
  value,
  { classes = false, mutate = false } = {},
) {
  const setFunc = setEntry.bind(undefined, { value, classes, mutate })
  return reduceParents({ target, query, setFunc, classes })
}

// Modify a target object multiple times for each matched property.
export const reduceParents = function ({ target, query, setFunc, classes }) {
  const entries = list(target, query, {
    childFirst: false,
    sort: false,
    classes,
  })
  return entries
    .filter(hasNoParentSet)
    .reduce((targetA, { path }) => setFunc(targetA, path, 0), target)
}

// If both a parent and a child property are set, the parent prevails
const hasNoParentSet = function ({ path: pathA }, indexA, entries) {
  return entries.every(
    ({ path: pathB }, indexB) =>
      indexA <= indexB || !isParentPath(pathB, pathA),
  )
}

// Use positional arguments for performance
// eslint-disable-next-line max-params
const setEntry = function ({ value, classes, mutate }, target, path, index) {
  if (index === path.length) {
    return value
  }

  const prop = path[index]
  const { value: defaultedTarget } = handleMissingValue(target, prop, classes)
  const childTarget = defaultedTarget[prop]
  const childValue = setEntry(
    { value, classes, mutate },
    childTarget,
    path,
    index + 1,
  )
  return setValue({ target: defaultedTarget, prop, childValue, mutate })
}

export const setValue = function ({ target, prop, childValue, mutate }) {
  return Array.isArray(target)
    ? setArrayValue({ target, prop, childValue, mutate })
    : setObjectValue({ target, prop, childValue, mutate })
}

const setArrayValue = function ({ target, prop, childValue, mutate }) {
  if (target[prop] === childValue) {
    return target
  }

  return setArray(target, prop, childValue)
}

const setObjectValue = function ({ target, prop, childValue, mutate }) {
  if (isNoopSet(target, prop, childValue)) {
    return target
  }

  return { ...target, [prop]: childValue }
}

// Do not set value if it has not changed.
// We distinguish between `undefined` values with the property set and unset.
const isNoopSet = function (target, prop, childValue) {
  return (
    target[prop] === childValue && (childValue !== undefined || prop in target)
  )
}
