import { getCombinationIds } from '../combination/ids.js'

// Select combinations according to the `select` or `limit` configuration
// properties
export const matchSelectors = function (combination, selectors) {
  if (selectors.length === 0) {
    return true
  }

  const combinationIds = getCombinationIds(combination)
  // eslint-disable-next-line fp/no-mutating-methods
  const matchingSelector = selectors
    .slice()
    .reverse()
    .find((selector) => matchIds(combinationIds, selector))

  if (matchingSelector !== undefined) {
    return !matchingSelector.negation
  }

  return selectors[0].negation
}

const matchIds = function (combinationIds, { intersect }) {
  return intersect.every((ids) => matchGroup(combinationIds, ids))
}

const matchGroup = function (combinationIds, ids) {
  return ids.some((id) => combinationIds.includes(id))
}
