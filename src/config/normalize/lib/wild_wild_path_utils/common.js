import { list, iterate, parent } from '../wild_wild_path/main.js'

// `list()` but without missing entries
export const listExisting = function (target, queryOrPath) {
  return list(target, queryOrPath).filter(isExisting)
}

const isExisting = function ({ missing }) {
  return !missing
}

// Modify a target object multiple times for each matched property.
// Ignore properties when one of their ancestors was matched too.
// Uses `iterate()` to keep memory consumption low.
export const reduceParents = function ({
  target,
  newTarget,
  queryOrPaths,
  setFunc,
  condition = returnTrue,
}) {
  const paths = []

  // eslint-disable-next-line fp/no-loops
  for (const entry of iterate(target, queryOrPaths)) {
    // eslint-disable-next-line max-depth
    if (shouldUseEntry(entry, paths, condition)) {
      // eslint-disable-next-line fp/no-mutating-methods
      paths.push(entry.path)
      // eslint-disable-next-line fp/no-mutation, no-param-reassign
      newTarget = setFunc(newTarget, entry, 0)
    }
  }

  return newTarget
}

const returnTrue = function () {
  return true
}

const shouldUseEntry = function (entry, paths, condition) {
  return !entry.missing && !parentIsSet(paths, entry.path) && condition(entry)
}

// If both a parent and a child property are set, the parent prevails
const parentIsSet = function (paths, path) {
  return paths.some((previousPath) => parent(previousPath, path))
}
