import { groupBy } from '../../../../../utils/group.js'

// We need to group entries by the last property to ensure `childFirst` order.
// We also sort when `sort` is true`
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
