import { isParentPath } from '../wild_wild_parser/main.js'
import { set, remove, list } from '../wild_wild_path/main.js'

// Returns an object with only the properties being queried.
export const pick = function (
  target,
  query,
  { sort, classes, inherited } = {},
) {
  const setFunc = pickEntry.bind(undefined, { classes, inherited })
  const entries = listEntries(target, query, {
    roots: true,
    sort,
    classes,
    inherited,
  })
  return entries.reduce(setFunc, {})
}

// Remove values not matching a query
// eslint-disable-next-line max-params
export const include = function (
  target,
  query,
  condition,
  { sort, entries, classes, inherited } = {},
) {
  const setFunc = pickEntry.bind(undefined, { classes, inherited })
  return reduceParents(setFunc, condition, {
    target,
    newTarget: {},
    query,
    sort,
    entries,
    classes,
    inherited,
  })
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
  { mutate, entries, classes, inherited } = {},
) {
  const setFunc = excludeEntry.bind(undefined, { mutate, classes, inherited })
  return reduceParents(setFunc, condition, {
    target,
    newTarget: target,
    query,
    sort: false,
    entries,
    classes,
    inherited,
  })
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
  { target, newTarget, query, sort, entries: entriesOpt, classes, inherited },
) {
  const entries = listEntries(target, query, {
    roots: false,
    sort,
    classes,
    inherited,
  })
  return entries
    .filter((entry) => meetsCondition({ condition, entry, target, entriesOpt }))
    .filter(hasNoParentSet)
    .reduce(setFunc, newTarget)
}

const listEntries = function (
  target,
  query,
  { roots, sort, classes, inherited },
) {
  return list(target, query, {
    childFirst: false,
    roots,
    leaves: false,
    sort,
    missing: false,
    entries: true,
    classes,
    inherited,
  })
}

const meetsCondition = function ({ condition, entry, target, entriesOpt }) {
  const entryA = entriesOpt ? entry : entry.value
  return condition(entryA, target)
}

// This is like the `roots` option. However, we cannot use that option since we
// need to apply `condition()` first.
const hasNoParentSet = function ({ path: pathA }, indexA, entries) {
  return entries.every(
    (entryB, indexB) => indexA <= indexB || !isParentPath(entryB.path, pathA),
  )
}
