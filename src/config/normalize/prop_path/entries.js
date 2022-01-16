import isPlainObj from 'is-plain-obj'

import { parseQuery } from './parse.js'

// List all values (and their associated path) matching a specific query for
// on specific target value.
export const listEntries = function (target, query) {
  const tokens = parseQuery(query)
  return tokens.reduce(listTokenEntries, [{ value: target, path: [] }])
}

const listTokenEntries = function (entries, token) {
  return entries.flatMap((entry) => getTokenEntries(entry, token))
}

const getTokenEntries = function (
  { value, path },
  { key, isArray, isAny, isStrict },
) {
  return isArray
    ? getArrayEntries({ value, path, key, isAny, isStrict })
    : getObjectEntries({ value, path, key, isAny, isStrict })
}

const getArrayEntries = function ({ value, path, key, isAny, isStrict }) {
  const missing = !Array.isArray(value)

  if (missing) {
    if (isStrict) {
      if (isAny || key === 0) {
        return [{ value, path: [...path, { key: 0, missing }] }]
      }

      return [{ value: undefined, path: [...path, { key, missing }] }]
    }

    return []
  }

  if (isAny) {
    return value.map((childValue, index) => ({
      value: childValue,
      path: [...path, { key: index, missing }],
    }))
  }

  return [{ value: value[key], path: [...path, { key, missing }] }]
}

const getObjectEntries = function ({ value, path, key, isAny, isStrict }) {
  const missing = !isPlainObj(value)

  if (missing) {
    if (isStrict && !isAny) {
      return [{ value: undefined, path: [...path, { key, missing }] }]
    }

    return []
  }

  if (isAny) {
    return Object.entries(value).map(([childKey, childValue]) => ({
      value: childValue,
      path: [...path, { key: childKey, missing }],
    }))
  }

  return [{ value: value[key], path: [...path, { key, missing }] }]
}
