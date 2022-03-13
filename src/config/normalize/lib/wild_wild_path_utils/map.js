// We split the core methods of `wild_wild_path` to keep it small, and provide
// additional utilities built on top of it.
import { list, get, set } from '../wild_wild_path/main.js'

// Map values matching a query.
// Missing entries are mapped too
//  - This allows logic such as adding default values
//  - However, if the map function does not modify the value, we do not set it
// We recurse from children to parents:
//  - This allows recursive logic such as cleaning up empty objects
//  - This also means newly set values are not recursed over:
//     - There are not many use cases for it
//        - When needed, this can also be done by the consumer logic
//     - This also avoids infinite recursion
export const map = function (target, query, mapFunc) {
  const entries = list(target, query, { childFirst: true, sort: false })
  return entries.reduce(
    (targetA, entry) => mapEntry(mapFunc, targetA, entry),
    target,
  )
}

const mapEntry = function (mapFunc, target, { path, query, missing }) {
  const value = get(target, path)
  const mappedValue = mapFunc({ path, query, value, missing })
  return value === mappedValue ? target : set(target, path, mappedValue)
}
