import { list } from './get.js'
import { set } from './set.js'

// Returns an object with only the properties being queried.
export const pick = function (target, queryOrPath) {
  const entries = list(target, queryOrPath)
  return entries.reduce(includeEntry, {})
}

const includeEntry = function (newTarget, { value, path }) {
  return set(newTarget, path, value)
}
