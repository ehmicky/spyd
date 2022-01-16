import { getPropResults } from './results.js'

export const getEntries = function (object, propPathStr) {
  const propResults = getPropResults(object, propPathStr)
  return propResults.map(getEntry)
}

const getEntry = function ({ value, path }) {
  const key = getKey({ path })
  return { key, value }
}

export const getValues = function (object, propPathStr) {
  const propResults = getPropResults(object, propPathStr)
  return propResults.map(getValue)
}

const getValue = function ({ value }) {
  return value
}

export const getKeys = function (object, propPathStr) {
  const propResults = getPropResults(object, propPathStr)
  return propResults.map(getKey)
}

const getKey = function ({ path }) {
  return path.map(getPathName).reduce(serializePathName, '')
}

const getPathName = function ({ name }) {
  return name
}

const serializePathName = function (names, name) {
  if (typeof name !== 'string') {
    return `${names}[${name}]`
  }

  return names === '' ? `${names}${name}` : `${names}.${name}`
}
