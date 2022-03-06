import { convertIndexInteger, convertIndexString } from '../parsing/path.js'
import { serialize } from '../parsing/serialize.js'
import { ANY_TOKEN } from '../parsing/special.js'

import { isRecurseObject } from './recurse.js'

// List all values (and their associated path) matching a specific query for
// on specific target value.
export const listEntries = function (target, path) {
  return path.reduce(listNodeEntries, [{ value: target, path: [] }])
}

const listNodeEntries = function (entries, node) {
  return entries.flatMap((entry) => getNodeEntries(entry, node))
}

const getNodeEntries = function ({ value, path }, node) {
  const token = Array.isArray(node) ? node[0] : node
  return token === ANY_TOKEN
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

  if (isRecurseObject(value)) {
    return Object.entries(value).map(([childKey, childValue]) => ({
      value: childValue,
      path: [...path, childKey],
    }))
  }

  return []
}

// For queries which do not use *, e.g. `a.b` or `a.1`
const getKeyEntries = function (value, path, token) {
  if (Array.isArray(value)) {
    const tokenA = convertIndexInteger(token)
    return [{ value: value[tokenA], path: [...path, tokenA] }]
  }

  if (isRecurseObject(value)) {
    const tokenA = convertIndexString(token)
    return [{ value: value[tokenA], path: [...path, tokenA] }]
  }

  return []
}

// Compute all entries properties from the basic ones
export const normalizeEntry = function ({ value, path }) {
  const query = serialize(path)
  return { value, path, query }
}
