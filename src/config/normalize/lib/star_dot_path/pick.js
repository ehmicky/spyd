import { listEntries } from './entries/main.js'
import { maybeParse } from './parsing/parse.js'
import { set } from './set.js'

// Returns an object with only the properties being queried.
export const pick = function (target, queryOrPath) {
  const path = maybeParse(queryOrPath)
  const entries = listEntries(target, path)
  return entries.reduce(includeEntry, {})
}

const includeEntry = function (newTarget, { value, path }) {
  return set(newTarget, path, value)
}
