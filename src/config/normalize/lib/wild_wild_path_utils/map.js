// We split the core methods of `wild_wild_path` to keep it small, and provide
// additional utilities built on top of it.
import { iterate, get, set } from '../wild_wild_path/main.js'

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
  // eslint-disable-next-line fp/no-let
  let newTarget = target

  // eslint-disable-next-line fp/no-loops
  for (const entry of iterate(target, query, { childFirst: true })) {
    // eslint-disable-next-line fp/no-mutation
    newTarget = mapEntry(mapFunc, newTarget, entry)
  }

  return newTarget
}

const mapEntry = function (mapFunc, target, { path, query, missing }) {
  const value = get(target, [path])
  const mappedValue = mapFunc({ path, query, value, missing })
  return value === mappedValue ? target : set(target, [path], mappedValue)
}
