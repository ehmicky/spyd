import { listEntries } from './entries/main.js'
import { maybeParse } from './parsing/parse.js'
import { pathToTokens } from './parsing/path.js'
import { serialize } from './parsing/serialize.js'
import { ANY } from './parsing/special.js'
import { isAnyTokens } from './parsing/token.js'

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
  validateAny(tokens)
  const [entry] = listEntries(target, tokens)
  return entry === undefined ? undefined : entry.value
}

const validateAny = function (tokens) {
  if (isAnyTokens(tokens)) {
    throw new Error(
      `Cannot use wildcard "${ANY}" when using get(): please use list() instead.`,
    )
  }
}

// TODO: optimize performance by stopping at soon as one entry is found
// TODO: check if a property key exists instead of checking if its value is
// `undefined`
export const has = function (target, queryOrPropNames) {
  const tokens = maybeParse(queryOrPropNames)
  const entries = listEntries(target, tokens)
  return entries.some(hasValue)
}

const hasValue = function ({ value }) {
  return value !== undefined
}
