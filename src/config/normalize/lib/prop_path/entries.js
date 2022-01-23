import isPlainObj from 'is-plain-obj'

// List all values (and their associated path) matching a specific query for
// on specific target value.
export const listEntries = function (target, tokens) {
  return tokens.reduce(listTokenEntries, [{ value: target, path: [] }])
}

const listTokenEntries = function (entries, token) {
  return entries.flatMap((entry) => getTokenEntries(entry, token))
}

const getTokenEntries = function ({ value, path }, { key, array, wildcard }) {
  return array
    ? getArrayEntries({ value, path, key, wildcard })
    : getObjectEntries({ value, path, key, wildcard })
}

const getArrayEntries = function ({ value, path, key, wildcard }) {
  if (!Array.isArray(value)) {
    return []
  }

  if (!wildcard) {
    return [{ value: value[key], path: [...path, key] }]
  }

  return value.map((childValue, index) => ({
    value: childValue,
    path: [...path, index],
  }))
}

const getObjectEntries = function ({ value, path, key, wildcard }) {
  if (!isPlainObj(value)) {
    return []
  }

  if (!wildcard) {
    return [{ value: value[key], path: [...path, key] }]
  }

  return Object.entries(value).map(([childKey, childValue]) => ({
    value: childValue,
    path: [...path, childKey],
  }))
}
