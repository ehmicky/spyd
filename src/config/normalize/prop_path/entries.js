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
  { key, isArray, wildcard, isStrict },
) {
  return isArray
    ? getArrayEntries({ value, path, key, wildcard, isStrict })
    : getObjectEntries({ value, path, key, wildcard, isStrict })
}

const getArrayEntries = function ({ value, path, key, wildcard, isStrict }) {
  const missing = !Array.isArray(value)
  return missing
    ? getMissingArrayEntries({ value, path, key, wildcard, isStrict, missing })
    : getNormalArrayEntries({ value, path, key, wildcard, missing })
}

const getMissingArrayEntries = function ({
  value,
  path,
  key,
  wildcard,
  isStrict,
  missing,
}) {
  if (!isStrict) {
    return []
  }

  if (wildcard || key === 0) {
    return [{ value, path: [...path, { key: 0, missing }] }]
  }

  return [{ value: undefined, path: [...path, { key, missing }] }]
}

const getNormalArrayEntries = function ({
  value,
  path,
  key,
  wildcard,
  missing,
}) {
  if (wildcard) {
    return value.map((childValue, index) => ({
      value: childValue,
      path: [...path, { key: index, missing }],
    }))
  }

  return [{ value: value[key], path: [...path, { key, missing }] }]
}

const getObjectEntries = function ({ value, path, key, wildcard, isStrict }) {
  const missing = !isPlainObj(value)
  return missing
    ? getMissingObjectEntries({ path, key, wildcard, isStrict, missing })
    : getNormalObjectEntries({ value, path, key, wildcard, missing })
}

const getMissingObjectEntries = function ({
  path,
  key,
  wildcard,
  isStrict,
  missing,
}) {
  if (!isStrict || wildcard) {
    return []
  }

  return [{ value: undefined, path: [...path, { key, missing }] }]
}

const getNormalObjectEntries = function ({
  value,
  path,
  key,
  wildcard,
  missing,
}) {
  if (wildcard) {
    return Object.entries(value).map(([childKey, childValue]) => ({
      value: childValue,
      path: [...path, { key: childKey, missing }],
    }))
  }

  return [{ value: value[key], path: [...path, { key, missing }] }]
}
