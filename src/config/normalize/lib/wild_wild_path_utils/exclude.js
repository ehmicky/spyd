import { get, remove } from '../wild_wild_path/main.js'

import { reduceParents } from './common.js'

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
