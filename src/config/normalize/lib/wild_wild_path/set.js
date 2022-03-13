import { isParentPath } from '../wild_wild_path_parser/main.js'

import { list } from './get.js'
import { handleMissingValue } from './iterate/missing.js'

// Set a value to one or multiple properties in `target` using a query string.
// Unless `mutate` is `true`, this returns a new copy
//  - The value is returned in both cases so consumers can forward the `mutate`
//    option without inspecting it
// eslint-disable-next-line max-params
export const set = function (
  target,
  query,
  value,
  { classes = false, mutate = false } = {},
) {
  validateClasses(classes, mutate)
  const setFunc = setEntry.bind(undefined, { value, classes, mutate })
  return reduceParents({ target, query, setFunc, classes })
}

// Class instances are not clonable. Therefore, they require `mutate`.
export const validateClasses = function (classes, mutate) {
  if (classes && !mutate) {
    throw new Error(
      'The "mutate" option must be true when the "classes" option is true.',
    )
  }
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

  const targetA = mutate ? target : [...target]
  // eslint-disable-next-line fp/no-mutation
  targetA[prop] = childValue
  return targetA
}

const setObjectValue = function ({ target, prop, childValue, mutate }) {
  if (isNoopSet(target, prop, childValue)) {
    return target
  }

  const targetA = mutate ? target : { ...target }
  // eslint-disable-next-line fp/no-mutation
  targetA[prop] = childValue
  return targetA
}

// Do not set value if it has not changed.
// We distinguish between `undefined` values with the property set and unset.
const isNoopSet = function (target, prop, childValue) {
  return (
    target[prop] === childValue && (childValue !== undefined || prop in target)
  )
}
