import { iterate } from './iterate/main.js'

// Retrieve all properties in `target` matching a query string.
// Unlike `get|has()` it also return missing entries, letting consumers filter
// them or not.
export const list = function (target, query, { childFirst = false } = {}) {
  return [...iterate(target, query, { childFirst })]
}

// Retrieve a single property's value in `target` matching a query string.
// Wildcards can be used, but only the first value is returned.
export const get = function (target, query, { childFirst = false } = {}) {
  const entry = find(target, query, { childFirst })
  return entry === undefined ? undefined : entry.value
}

// Check if a property is not missing according to a query
export const has = function (target, query) {
  return find(target, query, { childFirst: false }) !== undefined
}

// Find the first non-missing entry
const find = function (target, query, opts) {
  // eslint-disable-next-line fp/no-loops
  for (const { value, missing } of iterate(target, query, opts)) {
    // eslint-disable-next-line max-depth
    if (!missing) {
      return { value }
    }
  }
}
