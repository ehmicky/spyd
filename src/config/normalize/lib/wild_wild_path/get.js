import { iterate } from './iterate.js'

// Retrieve all properties in `target` matching a query string.
// Unlike `get|has()` it also return missing entries, letting consumers filter
// them or not.
export const list = function (target, queryOrPath) {
  return iterate(target, queryOrPath)
}

// Retrieve a single property's value in `target` matching a query string.
// Wildcards can be used, but only the first value is returned.
export const get = function (target, queryOrPath) {
  const entry = iterate(target, queryOrPath).find(isExisting)
  return entry === undefined ? undefined : entry.value
}

// Check if a property is not missing according to a query
export const has = function (target, queryOrPath) {
  return iterate(target, queryOrPath).some(isExisting)
}

const isExisting = function ({ missing }) {
  return !missing
}
