// Select combinations according to the `include` and `exclude` configuration
// properties
export const matchAllSelectors = function ({ ids }, allSelectors) {
  return allSelectors
    .filter(hasSelectors)
    .every(({ selectors, propName }) =>
      matchSelectors(ids, selectors, propName),
    )
}

const hasSelectors = function ({ selectors }) {
  return selectors.length !== 0
}

const matchSelectors = function (ids, selectors, propName) {
  const matches = selectors.some(({ intersect }) =>
    matchSelector(ids, intersect),
  )
  return propName === 'include' ? matches : !matches
}

const matchSelector = function (ids, intersect) {
  return intersect.every(({ ids: groupIds, inverse }) =>
    matchGroup(ids, groupIds, inverse),
  )
}

const matchGroup = function (ids, groupIds, inverse) {
  const matches = groupIds.some((id) => ids.includes(id))
  return inverse ? !matches : matches
}
