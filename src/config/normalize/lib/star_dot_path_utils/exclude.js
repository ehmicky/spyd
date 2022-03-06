import { get, remove } from '../star_dot_path/main.js'

import { listExisting } from './common.js'

// Remove values matching a query
export const exclude = function (target, queryOrPath, condition) {
  const entries = listExisting(target, queryOrPath)
  return entries.reduceRight(excludeEntry.bind(undefined, condition), target)
}

const excludeEntry = function (condition, target, { path, query, missing }) {
  const value = get(target, path)
  return condition({ path, query, value, missing })
    ? remove(target, path)
    : target
}
