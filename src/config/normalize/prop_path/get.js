import { listEntries } from './entries.js'

// Retrieve all entries (values + paths) matching a query string in `target`
export const getEntries = function (target, query) {
  const entries = listEntries(target, query)
  return entries.map(normalizeEntry)
}

const normalizeEntry = function ({ value, path }) {
  const pathStr = serializePath({ path })
  return { path: pathStr, value }
}

// Same but only retrieving the values
export const getValues = function (target, query) {
  const entris = listEntries(target, query)
  return entris.map(getEntryValue)
}

const getEntryValue = function ({ value }) {
  return value
}

// Same but only retrieving the paths
export const getPaths = function (target, query) {
  const entries = listEntries(target, query)
  return entries.map(serializePath)
}

const serializePath = function ({ path }) {
  return path.map(getPathKey).reduce(appendKey, '')
}

const getPathKey = function ({ key }) {
  return key
}

const appendKey = function (pathStr, key) {
  if (typeof key !== 'string') {
    return `${pathStr}[${key}]`
  }

  return pathStr === '' ? `${pathStr}${key}` : `${pathStr}.${key}`
}
