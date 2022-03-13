import {
  set,
  get,
  remove,
  iterate,
  isParentPath,
} from '../wild_wild_path/main.js'

// Returns an object with only the properties being queried.
export const pick = function (target, query) {
  return reduceParents(pickEntry, returnTrue, { target, newTarget: {}, query })
}

const pickEntry = function (target, { path, value }) {
  return set(target, path, value)
}

const returnTrue = function () {
  return true
}

// Remove values not matching a query
export const include = function (target, query, condition) {
  return reduceParents(pickEntry, condition, { target, newTarget: {}, query })
}

// Remove values matching a query
export const exclude = function (target, query, condition) {
  const conditionA = shouldExclude.bind(undefined, condition)
  return reduceParents(excludeEntry, conditionA, {
    target,
    newTarget: target,
    query,
  })
}

const excludeEntry = function (target, { path }) {
  return remove(target, path)
}

const shouldExclude = function (condition, { path, query, missing }, target) {
  const value = get(target, path)
  return condition({ path, query, value, missing })
}

// Modify a target object multiple times for each matched property.
// Ignore properties when one of their ancestors was matched too.
// Uses `iterate()` to keep memory consumption low.
const reduceParents = function (
  setFunc,
  condition,
  { target, newTarget, query },
) {
  const paths = []

  // eslint-disable-next-line fp/no-loops
  for (const entry of iterate(target, query, { childFirst: false })) {
    // eslint-disable-next-line max-depth
    if (shouldUseEntry({ entry, paths, newTarget, condition })) {
      // eslint-disable-next-line fp/no-mutating-methods
      paths.push(entry.path)
      // eslint-disable-next-line fp/no-mutation, no-param-reassign
      newTarget = setFunc(newTarget, entry, 0)
    }
  }

  return newTarget
}

const shouldUseEntry = function ({ entry, paths, newTarget, condition }) {
  return (
    !entry.missing &&
    !parentIsSet(paths, entry.path) &&
    condition(entry, newTarget)
  )
}

// If both a parent and a child property are set, the parent prevails
const parentIsSet = function (paths, path) {
  return paths.some((previousPath) => isParentPath(previousPath, path))
}
