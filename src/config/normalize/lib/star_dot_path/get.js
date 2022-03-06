import { listExistingEntries, normalizeEntry } from './entries.js'
import { parse } from './parsing/parse.js'

// Retrieve all properties in `target` matching a query string.
export const list = function (target, queryOrPath) {
  const path = parse(queryOrPath)
  const entries = listExistingEntries(target, path)
  return entries.map(normalizeEntry)
}

// Retrieve a single property's value in `target` matching a query string.
// Wildcards can be used, but only the first value is returned.
export const get = function (target, queryOrPath) {
  const path = parse(queryOrPath)
  const [entry] = listExistingEntries(target, path)
  return entry === undefined ? undefined : entry.value
}
