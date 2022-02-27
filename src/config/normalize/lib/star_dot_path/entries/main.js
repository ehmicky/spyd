import isPlainObj from 'is-plain-obj'

import { isAnyPart } from '../parsing/special.js'

import { getComplexEntries } from './complex.js'

// List all values (and their associated path) matching a specific query for
// on specific target value.
export const listEntries = function (target, tokens) {
  return tokens.reduce(listTokenEntries, [{ value: target, path: [] }])
}

const listTokenEntries = function (entries, token) {
  return entries.flatMap((entry) => getTokenEntries(entry, token))
}

const getTokenEntries = function ({ value, path }, token) {
  if (token.length > 1) {
    return getComplexEntries(value, path, token)
  }

  const [part] = token
  return isAnyPart(part)
    ? getAnyEntries(value, path)
    : getKeyEntries(value, path, part)
}

// For queries which use * on its own, e.g. `a.*`
const getAnyEntries = function (value, path) {
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

// For queries which do not use *, e.g. `a.b` or `a.1`
const getKeyEntries = function (value, path, part) {
  return Array.isArray(value) || isPlainObj(value)
    ? [{ value: value[part], path: [...path, part] }]
    : []
}
