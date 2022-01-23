import { listEntries } from './entries.js'

// Retrieve all entries (value + query + path) matching a query string
// in `target`
export const getEntries = function (target, query) {
  const entries = listEntries(target, query)
  return entries.map(normalizeEntry)
}

const normalizeEntry = function ({ value, path }) {
  const query = getEntryQuery({ path })
  return { value, query }
}

// Same but only retrieving the values
export const getValues = function (target, query) {
  const entris = listEntries(target, query)
  return entris.map(getEntryValue)
}

const getEntryValue = function ({ value }) {
  return value
}

// Same but only retrieving the queries
export const getQueries = function (target, query) {
  const entries = listEntries(target, query)
  return entries.map(getEntryQuery)
}

const getEntryQuery = function ({ path }) {
  const entryPath = getEntryPath({ path })
  return serializeQuery(entryPath)
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

// Same but only retrieving the paths
export const getPaths = function (target, query) {
  const entries = listEntries(target, query)
  return entries.map(getEntryPath)
}

const getEntryPath = function ({ path }) {
  return path.map(getPathKey)
}

const getPathKey = function ({ key }) {
  return key
}
