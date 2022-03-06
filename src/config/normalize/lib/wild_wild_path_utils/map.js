// We split the core methods of `wild_wild_path` to keep it small, and provide
// additional utilities built on top of it.
import { list, get, set } from '../wild_wild_path/main.js'

// Map values matching a query.
// Missing entries are mapped too
//  - This allows logic such as adding default values
//  - However, if the map function does not modify the value, we do not set it
export const map = function (target, queryOrPath, mapFunc) {
  const entries = list(target, queryOrPath)
  return entries.reduceRight(mapEntry.bind(undefined, mapFunc), target)
}

const mapEntry = function (mapFunc, target, { path, query, missing }) {
  const value = get(target, path)
  const mappedValue = mapFunc({ path, query, value, missing })
  return value === mappedValue ? target : set(target, path, mappedValue)
}
