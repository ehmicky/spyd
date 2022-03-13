import { set, get, remove, iterate, parent } from '../wild_wild_path/main.js'

// Returns an object with only the properties being queried.
export const pick = function (target, queryOrPaths) {
  return reduceParents({
    target,
    newTarget: {},
    queryOrPaths,
    setFunc: pickEntry,
    condition: returnTrue,
  })
}

const pickEntry = function (target, { path, value }) {
  return set(target, path, value)
}

const returnTrue = function () {
  return true
}

// Remove values matching a query
export const include = function (target, queryOrPaths, condition) {
  return reduceParents({
    target,
    newTarget: {},
    queryOrPaths,
    setFunc: pickEntry,
    condition,
  })
}

// Remove values matching a query
export const exclude = function (target, queryOrPaths, condition) {
  return reduceParents({
    target,
    newTarget: target,
    queryOrPaths,
    setFunc: excludeEntry,
    condition: shouldExclude.bind(undefined, condition),
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
const reduceParents = function ({
  target,
  newTarget,
  queryOrPaths,
  setFunc,
  condition,
}) {
  const paths = []

  // eslint-disable-next-line fp/no-loops
  for (const entry of iterate(target, queryOrPaths)) {
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
  return paths.some((previousPath) => parent(previousPath, path))
}
