import isPlainObj from 'is-plain-obj'

import { isAnyToken } from '../parsing/node.js'

import { getComplexEntries } from './complex.js'

// List all values (and their associated path) matching a specific query for
// on specific target value.
export const listEntries = function (target, nodes) {
  return nodes.reduce(listNodeEntries, [{ value: target, path: [] }])
}

const listNodeEntries = function (entries, node) {
  return entries.flatMap((entry) => getNodeEntries(entry, node))
}

const getNodeEntries = function ({ value, path }, node) {
  if (node.length > 1) {
    return getComplexEntries(value, path, node)
  }

  const [token] = node
  return isAnyToken(token)
    ? getAnyEntries(value, path)
    : getKeyEntries(value, path, token)
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
const getKeyEntries = function (value, path, token) {
  return Array.isArray(value) || isPlainObj(value)
    ? [{ value: value[token], path: [...path, token] }]
    : []
}
