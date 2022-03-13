import { set } from '../wild_wild_path/main.js'

import { listExisting, reduceParents } from './common.js'

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
export const include = function (target, queryOrPath, condition) {
  const entries = listExisting(target, queryOrPath)
  return entries.reduce(includeEntry.bind(undefined, condition), {})
}

const includeEntry = function (
  condition,
  target,
  { path, query, value, missing },
) {
  return condition({ path, query, value, missing })
    ? set(target, path, value)
    : target
}
