import { listEntries } from './entries/main.js'
import { maybeParse } from './parsing/parse.js'

// Check if a property is defined according to a query
export const has = function (target, queryOrPath) {
  const path = maybeParse(queryOrPath)
  const entries = listEntries(target, path)
  return entries.some(hasValue)
}

// We purposely do not distinguish between a missing property and a property set
// to `undefined` since this is a bad pattern for consumer logic to make that
// distinction
const hasValue = function ({ value }) {
  return value !== undefined
}
