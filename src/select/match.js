import { getCombinationIds } from '../combination/ids.js'

// Select combinations according to the `select` or `limit` configuration
// properties.
// Each selector:
//  - Is an intersection of union of identifiers
//  - Can be negated to exclude instead of including
//  - Can be combined as a union with other selectors
//  - This leads to: [not]((id or ...) and (otherId or ...) and ...) or ...
// This logic:
//  - Is expressive enough to allow selecting any sets of combinations,
//    regardless of the number of categories
//  - While still have a small number of complexity, only: list of identifiers,
//    "not" and top-level array.
//  - Avoids punctuation or hard-to-remember syntax
// The array order is significant:
//  - Only the last matching selector is used for each combination
//  - Combination with no matching selector are excluded|included depending on
//    whether the first selector is negated or not
//  - While this adds complexity, this removes the need for having two
//    different syntax tokens to express both inversion (of a single identifier)
//    and exclusion (of a selector), which would be required otherwise to be
//    able the following cases, for example, assuming two categories going from
//    a-z and 0-99:
//     - inclusion of almost all (but not all) combinations of a category,
//       e.g. include a1-99 and b-z0
//     - vice-versa, e.g. include all but a1-99 and b-z0
//     - inclusion of all but specific combinations, e.g. b2 and o5
export const matchSelectors = function (combination, selectors) {
  if (isEmpty(selectors)) {
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

// `select` defaults to including everything.
//  - This applies to when it is either `undefined` or an empty array.
//  - Making an empty array include nothing would be more consistent.
//    However, there is little use for it and it most likely mean the user
//    intent was to select everything.
const isEmpty = function (selectors) {
  return (
    selectors.length === 0 ||
    (selectors.length === 1 && selectors[0].intersect.length === 0)
  )
}

const matchIds = function (combinationIds, { intersect }) {
  return intersect.every((ids) => matchGroup(combinationIds, ids))
}

const matchGroup = function (combinationIds, ids) {
  return ids.some((id) => combinationIds.includes(id))
}
