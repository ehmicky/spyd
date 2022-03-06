import { listEntries, normalizeEntry } from './entries/main.js'
import { maybeParse } from './parsing/parse.js'

// Retrieve all properties in `target` matching a query string.
export const list = function (target, queryOrPath) {
  const path = maybeParse(queryOrPath)
  const entries = listEntries(target, path)
  return entries.map(normalizeEntry)
}

// Retrieve a single property's value in `target` matching a query string.
// Wildcards can be used, but only the first value is returned.
export const get = function (target, queryOrPath) {
  const path = maybeParse(queryOrPath)
  const [entry] = listEntries(target, path)
  return entry === undefined ? undefined : entry.value
}
