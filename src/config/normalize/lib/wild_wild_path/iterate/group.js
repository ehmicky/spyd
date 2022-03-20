import { groupBy } from '../../../../../utils/group.js'

// We need to group entries by the last property to ensure `childFirst` order.
// Iteration is guaranteed to return child entries before parent ones, or not,
// depending on `childFirst`
//  - This is useful for recursive logic which must often be applied in a
//    specific parent-child order
// We also sort siblings when `sort` is true`
export const groupSortChildEntries = function (childEntries, sort) {
  const childEntriesObj = groupBy(childEntries, getLastProp)
  return sort
    ? // eslint-disable-next-line fp/no-mutating-methods
      Object.keys(childEntriesObj)
        .sort()
        .map((prop) => childEntriesObj[prop])
    : Object.values(childEntriesObj)
}

const getLastProp = function ({ path }) {
  return path[path.length - 1]
}
