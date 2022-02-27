import { listEntries } from './entries.js'
import { maybeParse, ANY, isAnyPart, serialize, pathToTokens } from './parse.js'

// Retrieve all properties in `target` matching a query string.
// The return value is an object where the key is the path to each value.
export const list = function (target, queryOrPropNames) {
  const tokens = maybeParse(queryOrPropNames)
  const entries = listEntries(target, tokens)
  return Object.fromEntries(entries.map(normalizeEntry))
}

const normalizeEntry = function ({ value, path }) {
  const query = serialize(pathToTokens(path))
  return [query, value]
}

// Retrieve a single property's value in `target` matching a query string.
// Wildcards cannot be used.
export const get = function (target, queryOrPropNames) {
  const tokens = maybeParse(queryOrPropNames)
  validateWildcards(tokens)
  const [entry] = listEntries(target, tokens)
  return entry === undefined ? undefined : entry.value
}

const validateWildcards = function (tokens) {
  if (tokens.some((token) => token.some(isAnyPart))) {
    throw new Error(
      `Cannot use wildcard "${ANY}" when using get(): please use list() instead.`,
    )
  }
}

// TODO: optimize performance by stopping at soon as one entry is found
export const has = function (target, queryOrPropNames) {
  const tokens = maybeParse(queryOrPropNames)
  const entries = listEntries(target, tokens)
  return entries.some(hasValue)
}

const hasValue = function ({ value }) {
  return value !== undefined
}
