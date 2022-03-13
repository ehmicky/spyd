import { set, remove, list, isParentPath } from '../wild_wild_path/main.js'

// Returns an object with only the properties being queried.
export const pick = function (target, query, { sort } = {}) {
  return reduceParents(pickEntry, returnTrue, {
    target,
    newTarget: {},
    query,
    sort,
  })
}

const returnTrue = function () {
  return true
}

// Remove values not matching a query
// eslint-disable-next-line max-params
export const include = function (target, query, condition, { sort } = {}) {
  return reduceParents(pickEntry, condition, {
    target,
    newTarget: {},
    query,
    sort,
  })
}

const pickEntry = function (target, { path, value }) {
  return set(target, path, value)
}

// Remove values matching a query
export const exclude = function (target, query, condition) {
  return reduceParents(excludeEntry, condition, {
    target,
    newTarget: target,
    query,
    sort: false,
  })
}

const excludeEntry = function (target, { path }) {
  return remove(target, path)
}

// Modify a target object multiple times for each matched property.
const reduceParents = function (
  setFunc,
  condition,
  { target, newTarget, query, sort },
) {
  const entries = list(target, query, { childFirst: false, sort })
  return entries
    .filter((entry) => shouldUseEntry(entry, target, condition))
    .filter(hasNoParentSet)
    .reduce((targetA, entry) => setFunc(targetA, entry, 0), newTarget)
}

const shouldUseEntry = function (entry, target, condition) {
  return !entry.missing && condition(entry, target)
}

// If both a parent and a child property are set, the parent prevails
const hasNoParentSet = function ({ path: pathA }, indexA, entries) {
  return entries.every(
    ({ path: pathB }, indexB) =>
      indexA <= indexB || !isParentPath(pathB, pathA),
  )
}
