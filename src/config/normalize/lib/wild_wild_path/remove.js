import { handleMissingValue } from './iterate/expand.js'
import { validateClasses, reduceParents, setValue } from './set.js'

// Same as `set()` but removing a value
export const remove = function (
  target,
  query,
  { classes = false, mutate = false } = {},
) {
  validateClasses(classes, mutate)
  const setFunc = removeAnyEntry.bind(undefined, { classes, mutate })
  return reduceParents({ target, query, setFunc, classes })
}

// eslint-disable-next-line max-params
const removeAnyEntry = function ({ classes, mutate }, target, path, index) {
  return path.length === 0
    ? undefined
    : removeEntry({ classes, mutate, target, path, index })
}

const removeEntry = function ({ classes, mutate, target, path, index }) {
  const prop = path[index]

  if (handleMissingValue(target, prop, classes).missing) {
    return target
  }

  if (index === path.length - 1) {
    return removeValue(target, prop, mutate)
  }

  const childTarget = target[prop]
  const childValue = removeEntry({
    classes,
    mutate,
    target: childTarget,
    path,
    index: index + 1,
  })
  return setValue({ target, prop, childValue, mutate })
}

const removeValue = function (target, prop, mutate) {
  return Array.isArray(target, prop)
    ? removeArrayValue(target, prop, mutate)
    : removeObjectValue(target, prop, mutate)
}

// We make sure removing out-of-bound does not increase its length
const removeArrayValue = function (target, prop, mutate) {
  if (target[prop] === undefined) {
    return target
  }

  const targetA = mutate ? target : [...target]
  // eslint-disable-next-line fp/no-mutation
  targetA[prop] = undefined
  return targetA.every(isUndefined) ? [] : targetA
}

const isUndefined = function (item) {
  return item === undefined
}

const removeObjectValue = function (target, prop, mutate) {
  if (!(prop in target)) {
    return target
  }

  const targetA = mutate ? target : { ...target }
  // eslint-disable-next-line fp/no-delete
  delete targetA[prop]
  return targetA
}
