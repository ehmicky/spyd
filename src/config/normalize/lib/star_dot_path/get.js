import { listEntries } from './entries/main.js'
import { maybeParse } from './parsing/parse.js'
import { serialize } from './parsing/serialize.js'

// Retrieve all properties in `target` matching a query string.
// The return value is an object where the key is the path to each value.
export const list = function (target, queryOrPath) {
  const nodes = maybeParse(queryOrPath)
  const entries = listEntries(target, nodes)
  return Object.fromEntries(entries.map(normalizeEntry))
}

const normalizeEntry = function ({ value, path }) {
  const query = serialize(path)
  return [query, value]
}

// Retrieve a single property's value in `target` matching a query string.
// Wildcards can be used, but only the first value is returned.
// TODO: optimize performance by stopping at soon as one entry is found
export const get = function (target, queryOrPath) {
  const nodes = maybeParse(queryOrPath)
  const [entry] = listEntries(target, nodes)
  return entry === undefined ? undefined : entry.value
}

// TODO: optimize performance by stopping at soon as one entry is found
// TODO: check if a property key exists instead of checking if its value is
// `undefined`
export const has = function (target, queryOrPath) {
  const nodes = maybeParse(queryOrPath)
  const entries = listEntries(target, nodes)
  return entries.some(hasValue)
}

const hasValue = function ({ value }) {
  return value !== undefined
}
