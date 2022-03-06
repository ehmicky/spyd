import { set } from '../star_dot_path/main.js'

import { listExisting } from './common.js'

// Returns an object with only the properties being queried.
export const pick = function (target, queryOrPath) {
  const entries = listExisting(target, queryOrPath)
  return entries.reduce(pickEntry, {})
}

const pickEntry = function (target, { path, value }) {
  return set(target, path, value)
}
