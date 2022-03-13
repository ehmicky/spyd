import { iterate } from './iterate/main.js'

// Retrieve all properties in `target` matching a query string.
// Unlike `get|has()` it also return missing entries, letting consumers filter
// them or not.
export const list = function (
  target,
  query,
  { childFirst, roots, sort, missing, classes, inherited } = {},
) {
  return [
    ...iterate(target, query, {
      childFirst,
      roots,
      sort,
      missing,
      classes,
      inherited,
    }),
  ]
}

// Retrieve a single property's value in `target` matching a query string.
// Wildcards can be used, but only the first value is returned.
export const get = function (
  target,
  query,
  { childFirst, roots, sort, classes, inherited } = {},
) {
  const entry = getEntry(target, query, {
    childFirst,
    roots,
    sort,
    classes,
    inherited,
  })
  return entry === undefined ? undefined : entry.value
}

// Check if a property is not missing according to a query
export const has = function (target, query, { classes, inherited } = {}) {
  return (
    getEntry(target, query, {
      childFirst: false,
      roots: false,
      sort: false,
      classes,
      inherited,
    }) !== undefined
  )
}

// Find the first non-missing entry
const getEntry = function (
  target,
  query,
  { childFirst, roots, sort, classes, inherited },
) {
  return iterate(target, query, {
    childFirst,
    roots,
    sort,
    missing: false,
    classes,
    inherited,
  }).next().value
}
