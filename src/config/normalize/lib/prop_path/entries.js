import isPlainObj from 'is-plain-obj'

// List all values (and their associated path) matching a specific query for
// on specific target value.
export const listEntries = function (target, tokens) {
  return tokens.reduce(listTokenEntries, [{ value: target, path: [] }])
}

const listTokenEntries = function (entries, token) {
  return entries.flatMap((entry) => getTokenEntries(entry, token))
}

const getTokenEntries = function ({ value, path }, token) {
  if (token !== '*') {
    return [{ value: value[token], path: [...path, token] }]
  }

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
