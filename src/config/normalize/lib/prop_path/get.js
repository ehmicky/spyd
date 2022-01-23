import { listEntries } from './entries.js'
import { parse } from './parse.js'

// Retrieve all properties in `target` matching a query string.
// The return value is an object where the key is the path to each value.
export const list = function (target, query) {
  const tokens = parse(query)
  const entries = listEntries(target, tokens)
  return Object.fromEntries(entries.map(normalizeEntry))
}

const normalizeEntry = function ({ value, path }) {
  const query = serializeQuery(path)
  return [query, value]
}

const serializeQuery = function (path) {
  return path.reduce(appendKey, '')
}

const appendKey = function (pathStr, key) {
  if (typeof key !== 'string') {
    return `${pathStr}[${key}]`
  }

  return pathStr === '' ? `${pathStr}${key}` : `${pathStr}.${key}`
}

// Retrieve a single property's value in `target` matching a query string.
// Wildcards cannot be used.
export const get = function (target, query) {
  const tokens = parse(query)
  validateWildcards(tokens)
  const [entry] = listEntries(target, tokens)
  return entry === undefined ? undefined : entry.value
}

const validateWildcards = function (tokens) {
  if (tokens.some(hasWildcard)) {
    throw new Error(
      `Cannot use wildcard "*" when using get(): please use list() instead.`,
    )
  }
}

const hasWildcard = function ({ wildcard }) {
  return wildcard
}
