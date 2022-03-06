import { list, get } from './get.js'
import { set } from './set.js'

// Map values matching a query
export const map = function (target, queryOrPath, mapFunc) {
  const entries = list(target, queryOrPath)
  return entries.reduceRight(mapEntry.bind(undefined, mapFunc), target)
}

const mapEntry = function (mapFunc, target, { path, query }) {
  const value = get(target, path)
  const mappedValue = mapFunc({ path, query, value })
  return set(target, path, mappedValue)
}
