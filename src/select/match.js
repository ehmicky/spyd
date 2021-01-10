// Select combinations according to the `include`, `exclude`, `limit`
// configuration properties
export const matchSelectors = function (combination, { selectors, inverse }) {
  if (selectors.length === 0) {
    return true
  }

  const matches = selectors.some((selector) =>
    matchSelector(combination, selector),
  )
  return inverse ? !matches : matches
}

// Check if a selector matches the ids of a given combination
const matchSelector = function ({ ids }, { intersect }) {
  return intersect.every(({ ids: groupIds, inverse }) =>
    matchGroup(ids, groupIds, inverse),
  )
}

const matchGroup = function (ids, groupIds, inverse) {
  const matches = groupIds.some((id) => ids.includes(id))
  return inverse ? !matches : matches
}
