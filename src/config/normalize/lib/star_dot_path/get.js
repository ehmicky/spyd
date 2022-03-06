import { listEntries, normalizeEntry } from './entries.js'

// Retrieve all properties in `target` matching a query string.
export const list = function (target, queryOrPath) {
  const entries = listExistingEntries(target, queryOrPath)
  return entries.map(normalizeEntry)
}

// Retrieve a single property's value in `target` matching a query string.
// Wildcards can be used, but only the first value is returned.
export const get = function (target, queryOrPath) {
  const entries = listExistingEntries(target, queryOrPath)
  return entries.length === 0 ? undefined : entries[0].value
}

// Check if a property is not missing according to a query
export const has = function (target, queryOrPath) {
  const entries = listExistingEntries(target, queryOrPath)
  return entries.length !== 0
}

const listExistingEntries = function (target, queryOrPath) {
  return listEntries(target, queryOrPath).filter(isExisting)
}

const isExisting = function ({ missing }) {
  return !missing
}
