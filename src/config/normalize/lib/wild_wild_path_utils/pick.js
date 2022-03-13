import { set } from '../wild_wild_path/main.js'

import { reduceParents } from './common.js'

// Returns an object with only the properties being queried.
export const pick = function (target, queryOrPaths) {
  return reduceParents({
    target,
    newTarget: {},
    queryOrPaths,
    setFunc: pickEntry,
  })
}

const pickEntry = function (target, { path, value }) {
  return set(target, path, value)
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
