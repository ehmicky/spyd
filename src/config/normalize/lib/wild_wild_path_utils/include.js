import { set, remove, list } from '../wild_wild_path/main.js'
import { isParentPath } from '../wild_wild_path_parser/main.js'

// Returns an object with only the properties being queried.
export const pick = function (
  target,
  query,
  { sort, classes, inherited } = {},
) {
  return reduceParents(
    pickEntry.bind(undefined, { classes, inherited }),
    returnTrue,
    { target, newTarget: {}, query, sort, classes, inherited },
  )
}

const returnTrue = function () {
  return true
}

// Remove values not matching a query
// eslint-disable-next-line max-params
export const include = function (
  target,
  query,
  condition,
  { sort, classes, inherited } = {},
) {
  return reduceParents(
    pickEntry.bind(undefined, { classes, inherited }),
    condition,
    { target, newTarget: {}, query, sort, classes, inherited },
  )
}

const pickEntry = function (
  { classes, inherited },
  newTarget,
  { path, value },
) {
  return set(newTarget, path, value, { mutate: true, classes, inherited })
}

// Remove values matching a query
// eslint-disable-next-line max-params
export const exclude = function (
  target,
  query,
  condition,
  { mutate, classes, inherited } = {},
) {
  return reduceParents(
    excludeEntry.bind(undefined, { mutate, classes, inherited }),
    condition,
    { target, newTarget: target, query, sort: false, classes, inherited },
  )
}

const excludeEntry = function (
  { mutate, classes, inherited },
  newTarget,
  { path },
) {
  return remove(newTarget, path, { mutate, classes, inherited })
}

// Modify a target object multiple times for each matched property.
const reduceParents = function (
  setFunc,
  condition,
  { target, newTarget, query, sort, classes, inherited },
) {
  const entries = list(target, query, {
    childFirst: false,
    roots: false,
    sort,
    missing: false,
    classes,
    inherited,
  })
  return entries
    .filter((entry) => condition(entry, target))
    .filter(hasNoParentSet)
    .reduce((newTargetA, entry) => setFunc(newTargetA, entry, 0), newTarget)
}

// This is like the `roots` option. However, we cannot use that option since we
// need to apply `condition()` first.
const hasNoParentSet = function ({ path: pathA }, indexA, entries) {
  return entries.every(
    (entryB, indexB) => indexA <= indexB || !isParentPath(entryB.path, pathA),
  )
}
