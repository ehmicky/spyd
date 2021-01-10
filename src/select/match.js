import { getCombinationIds } from './ids.js'

// Select combinations according to the `include`, `exclude`, `limit`
// configuration properties
export const matchSelectors = function (combination, { selectors, inverse }) {
  if (selectors.length === 0) {
    return true
  }

  const ids = getCombinationIds(combination)
  const matches = selectors.some((selector) => matchIds(ids, selector))
  return inverse ? !matches : matches
}

export const matchSelector = function (combination, selector) {
  const ids = getCombinationIds(combination)
  return matchIds(ids, selector)
}

// Check if a selector matches the ids of a given combination
const matchIds = function (ids, { intersect }) {
  return intersect.every(({ ids: groupIds, inverse }) =>
    matchGroup(ids, groupIds, inverse),
  )
}

const matchGroup = function (ids, groupIds, inverse) {
  const matches = groupIds.some((id) => ids.includes(id))
  return inverse ? !matches : matches
}
