import { list, set } from '../star_dot_path/main.js'

// Returns an object with only the properties being queried.
export const pick = function (target, queryOrPath) {
  const entries = list(target, queryOrPath)
  return entries.reduce(pickEntry, {})
}

const pickEntry = function (target, { path, value }) {
  return set(target, path, value)
}
