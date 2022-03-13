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
// eslint-disable-next-line max-params
export const map = function (
  target,
  query,
  mapFunc,
  { mutate, roots, missing, classes, inherited } = {},
) {
  const entries = list(target, query, {
    childFirst: true,
    roots,
    sort: false,
    missing,
    classes,
    inherited,
  })
  return entries.reduce(
    (targetA, entry) =>
      mapEntry({
        mapFunc,
        target: targetA,
        entry,
        mutate,
        missing,
        classes,
        inherited,
      }),
    target,
  )
}

const mapEntry = function ({
  mapFunc,
  target,
  entry,
  entry: { path },
  mutate,
  missing,
  classes,
  inherited,
}) {
  const value = get(target, path, { missing, classes, inherited })
  const mappedValue = mapFunc({ ...entry, value })
  return value === mappedValue
    ? target
    : set(target, path, mappedValue, { mutate, missing, classes, inherited })
}
