import { listEntries } from './entries/main.js'
import { maybeParse } from './parsing/parse.js'

// Check if a property is defined according to a query
// TODO: optimize performance by stopping at soon as one entry is found
// TODO: check if a property key exists instead of checking if its value is
// `undefined`
export const has = function (target, queryOrPath) {
  const path = maybeParse(queryOrPath)
  const entries = listEntries(target, path)
  return entries.some(hasValue)
}

const hasValue = function ({ value }) {
  return value !== undefined
}
