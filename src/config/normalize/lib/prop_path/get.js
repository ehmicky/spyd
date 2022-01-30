import { listEntries } from './entries.js'
import { maybeParse, SEPARATOR } from './parse.js'

// Retrieve all properties in `target` matching a query string.
// The return value is an object where the key is the path to each value.
export const list = function (target, queryOrTokens) {
  const tokens = maybeParse(queryOrTokens)
  const entries = listEntries(target, tokens)
  return Object.fromEntries(entries.map(normalizeEntry))
}

const normalizeEntry = function ({ value, path }) {
  const query = serializeQuery(path)
  return [query, value]
}

const serializeQuery = function (path) {
  return path.reduce(appendKey, '').slice(1)
}

const appendKey = function (pathStr, key) {
  return `${pathStr}${SEPARATOR}${key}`
}

// Retrieve a single property's value in `target` matching a query string.
// Wildcards cannot be used.
export const get = function (target, queryOrTokens) {
  const tokens = maybeParse(queryOrTokens)
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
