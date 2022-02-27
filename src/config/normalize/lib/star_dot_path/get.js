import { listEntries } from './entries/main.js'
import { isAnyNodes } from './parsing/node.js'
import { maybeParse } from './parsing/parse.js'
import { pathToNodes } from './parsing/path.js'
import { serialize } from './parsing/serialize.js'
import { ANY } from './parsing/special.js'

// Retrieve all properties in `target` matching a query string.
// The return value is an object where the key is the path to each value.
export const list = function (target, queryOrPropNames) {
  const nodes = maybeParse(queryOrPropNames)
  const entries = listEntries(target, nodes)
  return Object.fromEntries(entries.map(normalizeEntry))
}

const normalizeEntry = function ({ value, path }) {
  const query = serialize(pathToNodes(path))
  return [query, value]
}

// Retrieve a single property's value in `target` matching a query string.
// Wildcards cannot be used.
export const get = function (target, queryOrPropNames) {
  const nodes = maybeParse(queryOrPropNames)
  validateAny(nodes)
  const [entry] = listEntries(target, nodes)
  return entry === undefined ? undefined : entry.value
}

const validateAny = function (nodes) {
  if (isAnyNodes(nodes)) {
    throw new Error(
      `Cannot use wildcard "${ANY}" when using get(): please use list() instead.`,
    )
  }
}

// TODO: optimize performance by stopping at soon as one entry is found
// TODO: check if a property key exists instead of checking if its value is
// `undefined`
export const has = function (target, queryOrPropNames) {
  const nodes = maybeParse(queryOrPropNames)
  const entries = listEntries(target, nodes)
  return entries.some(hasValue)
}

const hasValue = function ({ value }) {
  return value !== undefined
}
