import { listEntries } from './entries.js'

// Retrieve all properties in `target` matching a query string.
// The return value is an object where the key is the path to each value.
export const list = function (target, query) {
  const entries = listEntries(target, query)
  return Object.fromEntries(entries.map(normalizeEntry))
}

const normalizeEntry = function ({ value, path }) {
  const query = getEntryQuery(path)
  return [query, value]
}

const getEntryQuery = function (path) {
  const entryPath = getEntryPath(path)
  return serializeQuery(entryPath)
}

const getEntryPath = function (path) {
  return path.map(getPathKey)
}

const getPathKey = function ({ key }) {
  return key
}

const serializeQuery = function (entryPath) {
  return entryPath.reduce(appendKey, '')
}

const appendKey = function (pathStr, key) {
  if (typeof key !== 'string') {
    return `${pathStr}[${key}]`
  }

  return pathStr === '' ? `${pathStr}${key}` : `${pathStr}.${key}`
}
