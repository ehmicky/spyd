// Select combinations according to the `include`, `exclude`, `limit`
// configuration properties
export const matchSelectors = function ({ ids }, { selectors, propName }) {
  if (selectors.length === 0) {
    return true
  }

  const matches = selectors.some(({ intersect }) =>
    matchSelector(ids, intersect),
  )
  return propName === 'exclude' ? !matches : matches
}

// Check if a selector matches the ids of a given combination
const matchSelector = function (ids, intersect) {
  return intersect.every(({ ids: groupIds, inverse }) =>
    matchGroup(ids, groupIds, inverse),
  )
}

const matchGroup = function (ids, groupIds, inverse) {
  const matches = groupIds.some((id) => ids.includes(id))
  return inverse ? !matches : matches
}
