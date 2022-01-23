import isPlainObj from 'is-plain-obj'

// List all values (and their associated path) matching a specific query for
// on specific target value.
export const listEntries = function (target, tokens) {
  return tokens.reduce(listTokenEntries, [{ value: target, path: [] }])
}

const listTokenEntries = function (entries, token) {
  return entries.flatMap((entry) => getTokenEntries(entry, token))
}

const getTokenEntries = function (
  { value, path },
  { key, array, wildcard, loose },
) {
  return array
    ? getArrayEntries({ value, path, key, wildcard, loose })
    : getObjectEntries({ value, path, key, wildcard, loose })
}

const getArrayEntries = function ({ value, path, key, wildcard, loose }) {
  const missing = !Array.isArray(value)
  return missing
    ? getMissingArrayEntries({ value, path, key, wildcard, loose, missing })
    : getNormalArrayEntries({ value, path, key, wildcard, missing })
}

const getMissingArrayEntries = function ({
  value,
  path,
  key,
  wildcard,
  loose,
  missing,
}) {
  if (loose) {
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

const getObjectEntries = function ({ value, path, key, wildcard, loose }) {
  const missing = !isPlainObj(value)
  return missing
    ? getMissingObjectEntries({ path, key, wildcard, loose, missing })
    : getNormalObjectEntries({ value, path, key, wildcard, missing })
}

const getMissingObjectEntries = function ({
  path,
  key,
  wildcard,
  loose,
  missing,
}) {
  if (loose || wildcard) {
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
