import isPlainObj from 'is-plain-obj'

import { ANY } from './parse.js'

// List all values (and their associated path) matching a specific query for
// on specific target value.
export const listEntries = function (target, tokens) {
  return tokens.reduce(listTokenEntries, [{ value: target, path: [] }])
}

const listTokenEntries = function (entries, token) {
  return entries.flatMap((entry) => getTokenEntries(entry, token))
}

const getTokenEntries = function ({ value, path }, token) {
  return token === ANY
    ? getWildcardEntries(value, path)
    : getKeyEntries(value, path, token)
}

const getWildcardEntries = function (value, path) {
  if (Array.isArray(value)) {
    return value.map((childValue, index) => ({
      value: childValue,
      path: [...path, index],
    }))
  }

  if (isPlainObj(value)) {
    return Object.entries(value).map(([childKey, childValue]) => ({
      value: childValue,
      path: [...path, childKey],
    }))
  }

  return []
}

const getKeyEntries = function (value, path, token) {
  return Array.isArray(value) || isPlainObj(value)
    ? [{ value: value[token], path: [...path, token] }]
    : []
}
